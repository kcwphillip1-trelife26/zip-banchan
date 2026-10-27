// 초기 반찬 상품 데이터
const defaultDishes = [
    { id: 101, category: "menu", name: "한돈 돼지 수육 & 겉절이", price: 12000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" },
    { id: 102, category: "menu", name: "시골 돼지 김치찌개 (2인분)", price: 8500, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" },
    { id: 103, category: "menu", name: "영양 만점 콩자반 & 시금치나물", price: 4500, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80" },
    { id: 104, category: "menu", name: "수제 한방 족발 세트", price: 16000, img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80" },
    { id: 201, category: "sub", name: "주 3회 실속 알뜰 식단플랜 (월)", price: 89000, img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=400&q=80" },
    { id: 202, category: "sub", name: "주 5회 프리미엄 매일 식단플랜 (월)", price: 145000, img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80" },
    { id: 301, category: "lunch", name: "수제 제육볶음 정식 도시락", price: 9500, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80" },
    { id: 302, category: "lunch", name: "궁중 소불고기 영양 도시락", price: 12500, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80" }
];

let dishes = JSON.parse(localStorage.getItem('customDishes')) || defaultDishes;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = [];
let isSignup = false;

function init() {
    renderTopUserMenu();
    renderHeaderUtil();
    renderAllCategories();
    renderCart();
    renderMypage();
    renderAdmin();
}

function switchTab(el, sectionId) {
    // 일반 회원 권한 확인
    if (sectionId === 'admin' && (!currentUser || !currentUser.isAdmin)) {
        alert('🔒 접근 권한이 없습니다. 관리자 승인을 받은 계정만 접근 가능합니다.');
        return;
    }

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'none';

    if (el) el.classList.add('active');
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'mypage') renderMypage();
    if (sectionId === 'admin') renderAdmin();
}

function renderTopUserMenu() {
    const topMenu = document.getElementById('top-user-menu');
    if (currentUser) {
        topMenu.innerHTML = `
            <span><strong>${currentUser.name || currentUser.username}</strong>님 (${currentUser.isAdmin ? '👑관리자' : '일반회원'})</span>
            <a onclick="logout()">로그아웃</a>
        `;
    } else {
        topMenu.innerHTML = `
            <a onclick="openAuthModal()">로그인</a>
            <a onclick="openAuthModal(true)">회원가입</a>
        `;
    }
}

function renderHeaderUtil() {
    const util = document.getElementById('header-util');
    const adminNav = document.getElementById('admin-nav');

    if (currentUser) {
        util.innerHTML = `
            <span>마일리지: <strong style="color:var(--primary-color);">${(currentUser.mileage || 0).toLocaleString()} P</strong></span>
            <button class="btn-header" onclick="logout()">로그아웃</button>
        `;
        // 관리자 권한 소지자에게만 관리자 센터 탭 표시
        adminNav.style.display = currentUser.isAdmin ? 'block' : 'none';
    } else {
        util.innerHTML = `<button class="btn-header" onclick="openAuthModal()">로그인 / 회원가입</button>`;
        adminNav.style.display = 'none';
    }
}

function renderAllCategories() {
    const menus = dishes.filter(d => d.category === 'menu');
    const subs = dishes.filter(d => d.category === 'sub');
    const lunches = dishes.filter(d => d.category === 'lunch');

    document.getElementById('menu-grid').innerHTML = menus.map(d => createItemCardHTML(d)).join('');
    document.getElementById('sub-grid').innerHTML = subs.map(d => createItemCardHTML(d)).join('');
    document.getElementById('lunch-grid').innerHTML = lunches.map(d => createItemCardHTML(d)).join('');
}

function createItemCardHTML(item) {
    return `
        <div class="menu-card">
            <img src="${item.img}" class="menu-img" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'">
            <div class="menu-details">
                <div class="menu-title">${item.name}</div>
                <div class="menu-price">${item.price.toLocaleString()}원</div>
                <button class="btn-add" onclick="addToCart(${item.id})">장바구니 담기</button>
            </div>
        </div>
    `;
}

// [사이트 자체 반찬 등록 기능 (CMS)]
function addNewDish() {
    if (!currentUser || !currentUser.isAdmin) return;

    const name = document.getElementById('new-item-name').value.trim();
    const price = parseInt(document.getElementById('new-item-price').value);
    const category = document.getElementById('new-item-category').value;
    const img = document.getElementById('new-item-img').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

    if (!name || isNaN(price)) {
        alert('반찬 이름과 숫자로 된 가격을 올바르게 입력해 주세요.');
        return;
    }

    const newDish = { id: Date.now(), category, name, price, img };
    dishes.push(newDish);
    localStorage.setItem('customDishes', JSON.stringify(dishes));

    alert(`🎉 [${name}] 반찬이 웹사이트에 실시간 진열되었습니다!`);
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-img').value = '';

    renderAllCategories();
    renderAdmin();
}

// [사이트 자체 반찬 삭제 기능]
function deleteDish(dishId) {
    if (!currentUser || !currentUser.isAdmin) return;
    if (confirm('해당 반찬을 웹사이트에서 삭제하시겠습니까?')) {
        dishes = dishes.filter(d => d.id !== dishId);
        localStorage.setItem('customDishes', JSON.stringify(dishes));
        renderAllCategories();
        renderAdmin();
    }
}

// [관리자 권한 부여 기능]
function toggleAdminRole(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        user.isAdmin = !user.isAdmin;
        localStorage.setItem('users', JSON.stringify(users));
        alert(`[${user.name || user.username}] 님의 권한이 ${user.isAdmin ? '👑 관리자' : '일반회원'} (으)로 변경되었습니다.`);
        renderAdmin();
    }
}

function searchMenu() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();
    const filtered = dishes.filter(d => d.name.toLowerCase().includes(keyword));

    if (keyword !== "") {
        switchTab(document.querySelectorAll('.nav-item')[1], 'menu');
        document.getElementById('menu-grid').innerHTML = filtered.length > 0 
            ? filtered.map(d => createItemCardHTML(d)).join('')
            : `<p style="grid-column: 1/-1; text-align:center; color:#888; padding:30px;">'${keyword}' 검색 결과가 없습니다.</p>`;
    } else {
        renderAllCategories();
    }
}

function addToCart(itemId) {
    const item = dishes.find(d => d.id === itemId);
    if (item) {
        cart.push(item);
        document.getElementById('cart-count').innerText = cart.length;
        alert(`🛒 ${item.name}이(가) 장바구니에 담겼습니다.`);
        renderCart();
    }
}

function renderCart() {
    const list = document.getElementById('cart-list');
    if (cart.length === 0) {
        list.innerHTML = `<p style="color:#888; padding:25px 0; text-align:center;">장바구니가 비어 있습니다.</p>`;
        document.getElementById('cart-total-price').innerText = '0원';
        return;
    }

    let total = 0;
    list.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed #DDD;">
                <span>${item.name}</span>
                <div>
                    <strong style="margin-right:15px;">${item.price.toLocaleString()}원</strong>
                    <button class="btn-header" style="padding:2px 8px; font-size:11px;" onclick="removeFromCart(${index})">삭제</button>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('cart-total-price').innerText = total.toLocaleString() + '원';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    document.getElementById('cart-count').innerText = cart.length;
    renderCart();
}

function placeOrder() {
    if (!currentUser) {
        alert('주문을 위해 먼저 회원가입 및 로그인해 주세요.');
        openAuthModal();
        return;
    }
    if (cart.length === 0) {
        alert('장바구니에 상품을 담아주세요.');
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const payMethod = document.getElementById('payment-method').value;
    const memo = document.getElementById('delivery-memo').value || '요청사항 없음';

    if (payMethod === 'mileage') {
        if ((currentUser.mileage || 0) < total) {
            alert('마일리지가 부족합니다! 마이페이지에서 충전해 주세요.');
            switchTab(document.querySelectorAll('.nav-item')[5], 'mypage');
            return;
        }
        currentUser.mileage -= total;
    }

    let payText = payMethod === 'card' ? '신용/체크카드' : (payMethod === 'trans' ? '실시간 계좌이체' : '마일리지 잔액');

    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString('ko-KR'),
        userName: currentUser.name || currentUser.username,
        phone: currentUser.phone || '미입력',
        fullAddress: `(${currentUser.zipcode || '00000'}) ${currentUser.roadAddress || ''} ${currentUser.detailAddress || ''}`,
        items: cart.map(c => c.name).join(', '),
        totalPrice: total,
        payMethod: payText,
        memo: memo
    };

    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    updateUserData();

    cart = [];
    document.getElementById('cart-count').innerText = '0';
    document.getElementById('delivery-memo').value = '';
    renderCart();
    renderHeaderUtil();
    renderTopUserMenu();
    alert(`🎉 [${payText}] 결제가 완료되었습니다!\n내일 아침 7시 전 지정하신 주소로 새벽 배달됩니다.`);
    switchTab(document.querySelectorAll('.nav-item')[5], 'mypage');
}

function renderMypage() {
    const container = document.getElementById('mypage-content');
    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <p style="color:#666; margin-bottom:20px;">회원가입/로그인 후 개인정보 및 주문 내역 조회가 가능합니다.</p>
                <button class="btn-primary" style="max-width:220px;" onclick="openAuthModal()">로그인 / 정식 회원가입하기</button>
            </div>
        `;
        return;
    }

    const myOrders = orders.filter(o => o.userName === (currentUser.name || currentUser.username));

    container.innerHTML = `
        <div style="background:var(--gray-bg); padding:20px; border-radius:12px; margin-bottom:25px;">
            <h3>👋 안녕하세요, <strong>${currentUser.name || currentUser.username}</strong>님! (${currentUser.isAdmin ? '👑 최고 관리자' : '일반 회원'})</h3>
            <p style="font-size:14px; color:#555; margin-top:8px;">📱 연락처: ${currentUser.phone}</p>
            <p style="font-size:14px; color:#555;">🏠 아침 배송 주소: (${currentUser.zipcode || '-'}) ${currentUser.roadAddress || ''} ${currentUser.detailAddress || ''}</p>
            <p style="font-size:16px; margin-top:10px;">💰 보유 마일리지: <strong style="color:var(--primary-color); font-size:20px;">${(currentUser.mileage || 0).toLocaleString()} P</strong></p>
        </div>

        <div style="margin-bottom:30px;">
            <h3>💳 마일리지 충전</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <select id="mypage-charge-amt" class="form-control" style="flex:1;">
                    <option value="10000">10,000원 (+500P 적립)</option>
                    <option value="30000">30,000원 (+2,000P 적립)</option>
                    <option value="50000">50,000원 (+5,000P 적립)</option>
                </select>
                <button class="btn-primary" style="width:140px;" onclick="chargeMileageInMypage()">충전하기</button>
            </div>
        </div>

        <div>
            <h3>📦 나의 배달 주문 내역</h3>
            ${myOrders.length === 0 ? '<p style="color:#888; padding:20px 0;">주문 내역이 없습니다.</p>' : `
                <table>
                    <thead>
                        <tr>
                            <th>주문일시</th>
                            <th>주문 상품</th>
                            <th>결제 방식</th>
                            <th>결제 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myOrders.map(o => `
                            <tr>
                                <td>${o.date}</td>
                                <td>${o.items}</td>
                                <td>${o.payMethod}</td>
                                <td><strong>${o.totalPrice.toLocaleString()}원</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

function chargeMileageInMypage() {
    const amt = parseInt(document.getElementById('mypage-charge-amt').value);
    currentUser.mileage = (currentUser.mileage || 0) + amt;
    updateUserData();
    alert(`${amt.toLocaleString()} 마일리지가 충전되었습니다!`);
    renderHeaderUtil();
    renderMypage();
}

// [통제된 최고 관리자 페이지 렌더링]
function renderAdmin() {
    const tbody = document.getElementById('admin-order-list');
    const dishList = document.getElementById('admin-dish-manage-list');
    const userList = document.getElementById('admin-user-manage-list');

    if (!currentUser || !currentUser.isAdmin) return;

    // 1) 반찬 관리 목록
    dishList.innerHTML = dishes.map(d => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #EEE;">
            <span>[${d.category}] <strong>${d.name}</strong> (${d.price.toLocaleString()}원)</span>
            <button class="btn-header" style="padding:2px 8px; font-size:11px; color:red;" onclick="deleteDish(${d.id})">삭제</button>
        </div>
    `).join('');

    // 2) 가입 회원 목록 및 권한 부여
    userList.innerHTML = users.length === 0 ? '<p style="color:#888;">가입된 일반 회원이 없습니다.</p>' : users.map(u => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #EEE;">
            <span>아이디: <strong>${u.username}</strong> | 이름: ${u.name} | 권한: ${u.isAdmin ? '👑 관리자' : '일반회원'}</span>
            <button class="btn-header" style="padding:2px 8px; font-size:11px;" onclick="toggleAdminRole('${u.username}')">
                ${u.isAdmin ? '관리자 권한 해제' : '관리자 권한 부여'}
            </button>
        </div>
    `).join('');

    // 3) 고객 주문 목록
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding:20px;">주문 내역이 없습니다.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.date}</td>
            <td><strong>${o.userName}</strong></td>
            <td>${o.phone}</td>
            <td>${o.fullAddress}</td>
            <td>${o.items}</td>
            <td>${o.payMethod}</td>
            <td><strong>${o.totalPrice.toLocaleString()}원</strong></td>
        </tr>
    `).join('');
}

function openAuthModal(signupMode = false) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'block';
    if (signupMode) {
        isSignup = false;
        toggleAuthMode();
    }
}

function toggleAuthMode() {
    isSignup = !isSignup;
    document.getElementById('auth-title').innerText = isSignup ? '정식 회원가입' : '로그인';
    document.getElementById('signup-extra-fields').style.display = isSignup ? 'block' : 'none';
    document.getElementById('auth-submit-btn').innerText = isSignup ? '가입 완료하기' : '로그인';
    document.getElementById('auth-toggle-text').innerText = isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 정식 회원가입';
}

function submitAuth() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!username || !password) {
        alert('아이디와 비밀번호를 입력하세요.');
        return;
    }

    if (isSignup) {
        const name = document.getElementById('auth-name').value.trim();
        const phone = document.getElementById('auth-phone').value.trim();
        const zipcode = document.getElementById('auth-zipcode').value.trim();
        const roadAddress = document.getElementById('auth-road-address').value.trim();
        const detailAddress = document.getElementById('auth-detail-address').value.trim();
        const recommender = document.getElementById('auth-recommender').value.trim();

        if (!name || !phone || !roadAddress) {
            alert('이름, 연락처, 도로명 주소 필수 항목을 입력하세요.');
            return;
        }

        if (users.find(u => u.username === username)) {
            alert('이미 존재하는 아이디입니다.');
            return;
        }

        let bonusMileage = 3000;

        if (recommender) {
            const targetUser = users.find(u => u.username === recommender);
            if (targetUser) {
                targetUser.mileage = (targetUser.mileage || 0) + 1000;
                bonusMileage += 1000;
                alert(`🎁 추천인 [${recommender}]님이 확인되어 두 분 모두에게 1,000P 추가 적립되었습니다!`);
            }
        }

        const newUser = {
            username,
            password,
            name,
            phone,
            zipcode,
            roadAddress,
            detailAddress,
            mileage: bonusMileage,
            isAdmin: username === 'admin' // 최고 관리자는 admin
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        alert(`🎉 회원가입을 축하합니다! (${bonusMileage.toLocaleString()} P 적립)`);
    } else {
        if (username === 'admin' && password === '1234') {
            currentUser = { username: 'admin', name: '최고 관리자', phone: '010-0000-0000', roadAddress: '본사', isAdmin: true, mileage: 999999 };
        } else {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                alert('가입되지 않은 아이디이거나 비밀번호가 틀렸습니다. 회원가입을 먼저 진행해 주세요.');
                return;
            }
            currentUser = user;
        }
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderHeaderUtil();
    renderTopUserMenu();
    switchTab(document.querySelectorAll('.nav-item')[0], 'intro');
}

function updateUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx !== -1) {
        users[idx] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    renderHeaderUtil();
    renderTopUserMenu();
    alert('로그아웃 되었습니다.');
    switchTab(document.querySelectorAll('.nav-item')[0], 'intro');
}

init();