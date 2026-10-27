// ==========================================
// 1. 초기 기본 상품 데이터 (아임웹 카테고리별)
// ==========================================

// (1) 오늘의 반찬 목록
const defaultMenuDishes = [
    { id: 101, category: "menu", name: "한돈 돼지 수육 & 겉절이", price: 12000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80" },
    { id: 102, category: "menu", name: "시골 돼지 김치찌개 (2인분)", price: 8500, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" },
    { id: 103, category: "menu", name: "영양 만점 콩자반 & 시금치나물", price: 4500, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80" },
    { id: 104, category: "menu", name: "수제 한방 족발 세트", price: 16000, img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80" }
];

// (2) 반찬 정기구독 상품
const defaultSubDishes = [
    { id: 201, category: "sub", name: "주 3회 실속 알뜰 식단플랜 (월)", price: 89000, img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=400&q=80" },
    { id: 202, category: "sub", name: "주 5회 프리미엄 매일 식단플랜 (월)", price: 145000, img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80" }
];

// (3) 프리미엄 도시락 상품
const defaultLunchDishes = [
    { id: 301, category: "lunch", name: "수제 제육볶음 정식 도시락", price: 9500, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80" },
    { id: 302, category: "lunch", name: "궁중 소불고기 영양 도시락", price: 12500, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=400&q=80" }
];

// ==========================================
// 2. 글로벌 상태 변수 관리
// ==========================================
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = [];
let isSignup = false;

// ==========================================
// 3. 앱 초기화 (Init)
// ==========================================
function init() {
    renderTopUserMenu();
    renderHeaderUtil();
    renderAllCategories();
    renderCart();
    renderMypage();
    renderAdmin();
}

// 탭 전환 함수
function switchTab(el, sectionId) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'none';

    if (el) el.classList.add('active');
    document.getElementById(sectionId).classList.add('active');

    // 탭 이동 시 렌더링 갱신
    if (sectionId === 'mypage') renderMypage();
    if (sectionId === 'admin') renderAdmin();
}

// 최상단 띠 배너 로그인 메뉴 렌더링
function renderTopUserMenu() {
    const topMenu = document.getElementById('top-user-menu');
    if (currentUser) {
        topMenu.innerHTML = `
            <span><strong>${currentUser.name || currentUser.username}</strong>님 반가워요!</span>
            <a onclick="logout()">로그아웃</a>
        `;
    } else {
        topMenu.innerHTML = `
            <a onclick="openAuthModal()">로그인</a>
            <a onclick="openAuthModal(true)">회원가입</a>
        `;
    }
}

// 헤더 유틸리티 메뉴 렌더링
function renderHeaderUtil() {
    const util = document.getElementById('header-util');
    const adminNav = document.getElementById('admin-nav');

    if (currentUser) {
        util.innerHTML = `
            <span>마일리지: <strong style="color:var(--primary-color);">${(currentUser.mileage || 0).toLocaleString()} P</strong></span>
            <button class="btn-header" onclick="logout()">로그아웃</button>
        `;
        // 관리자 전용 탭 표출 통제
        adminNav.style.display = currentUser.isAdmin ? 'block' : 'none';
    } else {
        util.innerHTML = `<button class="btn-header" onclick="openAuthModal()">로그인 / 회원가입</button>`;
        adminNav.style.display = 'none';
    }
}

// 카테고리별 상품 그리드 렌더링
function renderAllCategories() {
    // 1. 오늘의 반찬
    document.getElementById('menu-grid').innerHTML = defaultMenuDishes.map(d => createItemCardHTML(d)).join('');
    // 2. 반찬 정기구독
    document.getElementById('sub-grid').innerHTML = defaultSubDishes.map(d => createItemCardHTML(d)).join('');
    // 3. 프리미엄 도시락
    document.getElementById('lunch-grid').innerHTML = defaultLunchDishes.map(d => createItemCardHTML(d)).join('');
}

function createItemCardHTML(item) {
    return `
        <div class="menu-card">
            <img src="${item.img}" class="menu-img" alt="${item.name}">
            <div class="menu-details">
                <div class="menu-title">${item.name}</div>
                <div class="menu-price">${item.price.toLocaleString()}원</div>
                <button class="btn-add" onclick="addToCart(${item.id}, '${item.category}')">장바구니 담기</button>
            </div>
        </div>
    `;
}

// 반찬 검색 기능
function searchMenu() {
    const keyword = document.getElementById('search-input').value.toLowerCase().trim();
    const allDishes = [...defaultMenuDishes, ...defaultSubDishes, ...defaultLunchDishes];
    const filtered = allDishes.filter(d => d.name.toLowerCase().includes(keyword));

    if (keyword !== "") {
        switchTab(document.querySelectorAll('.nav-item')[1], 'menu');
        document.getElementById('menu-grid').innerHTML = filtered.length > 0 
            ? filtered.map(d => createItemCardHTML(d)).join('')
            : `<p style="grid-column: 1/-1; text-align:center; color:#888; padding:30px;">'${keyword}' 검색 결과가 없습니다.</p>`;
    } else {
        renderAllCategories();
    }
}

// 장바구니 담기
function addToCart(itemId, category) {
    let allDishes = [...defaultMenuDishes, ...defaultSubDishes, ...defaultLunchDishes];
    const item = allDishes.find(d => d.id === itemId);
    if (item) {
        cart.push(item);
        document.getElementById('cart-count').innerText = cart.length;
        alert(`🛒 ${item.name}이(가) 장바구니에 담겼습니다.`);
        renderCart();
    }
}

// 장바구니 렌더링
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

// 아침 배달 주문 결제 처리
function placeOrder() {
    if (!currentUser) {
        alert('주문을 위해 먼저 로그인해 주세요.');
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

    // 마일리지 결제 시 잔액 확인
    if (payMethod === 'mileage') {
        if ((currentUser.mileage || 0) < total) {
            alert('마일리지가 부족합니다! 마이페이지에서 먼저 마일리지를 충전해 주세요.');
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
        address: currentUser.address || '미입력',
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
    alert(`🎉 [${payText}] 결제가 완료되었습니다!\n내일 아침 7시 전 지정하신 주소로 안전하게 새벽 배달됩니다.`);
    switchTab(document.querySelectorAll('.nav-item')[5], 'mypage');
}

// 마이페이지 렌더링
function renderMypage() {
    const container = document.getElementById('mypage-content');
    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <p style="color:#666; margin-bottom:20px;">로그인 후 마이페이지 정보 및 마일리지 관리가 가능합니다.</p>
                <button class="btn-primary" style="max-width:200px;" onclick="openAuthModal()">로그인 / 회원가입하기</button>
            </div>
        `;
        return;
    }

    const myOrders = orders.filter(o => o.userName === (currentUser.name || currentUser.username));

    container.innerHTML = `
        <div style="background:var(--gray-bg); padding:20px; border-radius:12px; margin-bottom:25px;">
            <h3>👋 안녕하세요, <strong>${currentUser.name || currentUser.username}</strong>님!</h3>
            <p style="font-size:14px; color:#555; margin-top:5px;">📱 연락처: ${currentUser.phone || '미등록'}</p>
            <p style="font-size:14px; color:#555;">🚚 아침 배송지: ${currentUser.address || '미등록'}</p>
            <p style="font-size:16px; margin-top:10px;">💰 보유 마일리지: <strong style="color:var(--primary-color); font-size:20px;">${(currentUser.mileage || 0).toLocaleString()} P</strong></p>
        </div>

        <div style="margin-bottom:30px;">
            <h3>💳 마일리지 충전하기</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <select id="mypage-charge-amt" class="form-control" style="flex:1;">
                    <option value="10000">10,000원 (+500P 추가 적립)</option>
                    <option value="30000">30,000원 (+2,000P 추가 적립)</option>
                    <option value="50000">50,000원 (+5,000P 추가 적립)</option>
                </select>
                <button class="btn-primary" style="width:140px;" onclick="chargeMileageInMypage()">충전하기</button>
            </div>
        </div>

        <div>
            <h3>📦 나의 아침 배달 주문 내역</h3>
            ${myOrders.length === 0 ? '<p style="color:#888; padding:20px 0;">최근 주문 내역이 없습니다.</p>' : `
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
    alert(`${amt.toLocaleString()} 마일리지가 성공적으로 충전되었습니다!`);
    renderHeaderUtil();
    renderMypage();
}

// 관리자 주문 및 보안 데이터 조회 모드
function renderAdmin() {
    const tbody = document.getElementById('admin-order-list');
    if (!currentUser || !currentUser.isAdmin) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding:20px;">🔒 접근 권한이 없습니다. (관리자 아이디 admin으로 로그인하세요)</td></tr>`;
        return;
    }

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding:20px;">주문 내역이 없습니다.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.date}</td>
            <td><strong>${o.userName}</strong></td>
            <td>${o.phone}</td>
            <td>${o.address}</td>
            <td>${o.items}</td>
            <td>${o.payMethod}</td>
            <td><strong>${o.totalPrice.toLocaleString()}원</strong></td>
        </tr>
    `).join('');
}

// 로그인 / 회원가입 모달 제어
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
    document.getElementById('auth-title').innerText = isSignup ? '회원가입' : '로그인';
    document.getElementById('signup-extra-fields').style.display = isSignup ? 'block' : 'none';
    document.getElementById('auth-submit-btn').innerText = isSignup ? '가입하기' : '로그인';
    document.getElementById('auth-toggle-text').innerText = isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입';
}

// 네이버 / 구글 소셜 간편 로그인 시뮬레이션
function socialLogin(provider) {
    currentUser = {
        username: `${provider}_user`,
        name: `${provider} 사용자`,
        phone: "010-1234-5678",
        address: "서울시 도봉구 방학동 수제아파트 101동",
        mileage: 5000,
        isAdmin: false
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderHeaderUtil();
    renderTopUserMenu();
    alert(`🎉 ${provider} 계정으로 간편 로그인이 완료되었습니다! (5,000P 적립)`);
    switchTab(document.querySelectorAll('.nav-item')[0], 'intro');
}

function submitAuth() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!username || !password) {
        alert('아이디와 비밀번호를 입력하세요.');
        return;
    }

    if (isSignup) {
        if (users.find(u => u.username === username)) {
            alert('이미 존재하는 아이디입니다.');
            return;
        }
        const newUser = {
            username,
            password,
            name: document.getElementById('auth-name').value || username,
            phone: document.getElementById('auth-phone').value || '010-0000-0000',
            address: document.getElementById('auth-address').value || '주소 미입력',
            mileage: 3000, // 신규가입 3,000P 지급
            isAdmin: username === 'admin'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        alert('🎉 가입을 축하합니다! 신규 회원가입 3,000 마일리지가 적립되었습니다.');
    } else {
        if (username === 'admin' && password === '1234') {
            currentUser = { username: 'admin', name: '최고 관리자', isAdmin: true, mileage: 999999 };
        } else {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                alert('아이디 또는 비밀번호가 일치하지 않습니다.');
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

// 앱 실행
init();