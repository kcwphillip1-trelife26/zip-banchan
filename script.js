// 기본 반찬 데이터
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
let chargeRequests = JSON.parse(localStorage.getItem('chargeRequests')) || []; // 요구사항 7 & 11: 마일리지 충전 신청 대기열
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
    // 요구사항 8: 오직 admin 계정으로 들어왔을 때만 최고 관리자 센터 접근 허용
    if (sectionId === 'admin') {
        if (!currentUser || currentUser.username !== 'admin') {
            alert('🔒 최고 관리자(admin) 계정으로 로그인한 경우에만 접근할 수 있습니다.');
            return;
        }
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

function renderHeaderUtil() {
    const util = document.getElementById('header-util');
    const adminNav = document.getElementById('admin-nav');

    if (currentUser) {
        util.innerHTML = `
            <span>마일리지: <strong style="color:var(--primary-color);">${(currentUser.mileage || 0).toLocaleString()} P</strong></span>
            <button class="btn-header" onclick="logout()">로그아웃</button>
        `;
        // 요구사항 8: admin 계정에만 관리자 배너/탭을 표출
        adminNav.style.display = (currentUser.username === 'admin') ? 'block' : 'none';
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

// 요구사항 9: .jpg 파일 경로 및 URL 등록 지원
function addNewDish() {
    if (!currentUser || currentUser.username !== 'admin') return;

    const name = document.getElementById('new-item-name').value.trim();
    const price = parseInt(document.getElementById('new-item-price').value);
    const category = document.getElementById('new-item-category').value;
    const img = document.getElementById('new-item-img').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

    if (!name || isNaN(price)) {
        alert('반찬 이름과 올바른 가격을 입력하세요.');
        return;
    }

    const newDish = { id: Date.now(), category, name, price, img };
    dishes.push(newDish);
    localStorage.setItem('customDishes', JSON.stringify(dishes));

    alert(`🎉 [${name}] 반찬이 정상적으로 웹사이트에 진열되었습니다!`);
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-img').value = '';

    renderAllCategories();
    renderAdmin();
}

function deleteDish(dishId) {
    if (!currentUser || currentUser.username !== 'admin') return;
    if (confirm('해당 반찬을 삭제하시겠습니까?')) {
        dishes = dishes.filter(d => d.id !== dishId);
        localStorage.setItem('customDishes', JSON.stringify(dishes));
        renderAllCategories();
        renderAdmin();
    }
}

// 요구사항 2: 카카오/다음 우편번호 찾기 연동
function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            document.getElementById('auth-zipcode').value = data.zonecode;
            document.getElementById('auth-road-address').value = data.roadAddress || data.jibunAddress;
            document.getElementById('auth-detail-address').focus();
        }
    }).open();
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

// 요구사항 5 & 6: 마일리지 단일 결제 및 배송 희망시간 반영
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

    if ((currentUser.mileage || 0) < total) {
        alert('보유 마일리지가 부족합니다! 마이페이지에서 먼저 마일리지 충전을 신청해 주세요.');
        switchTab(document.querySelectorAll('.nav-item')[5], 'mypage');
        return;
    }

    const deliveryTime = document.getElementById('delivery-time').value;
    const memo = document.getElementById('delivery-memo').value || '요청사항 없음';

    currentUser.mileage -= total;

    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString('ko-KR'),
        userName: currentUser.name || currentUser.username,
        phone: currentUser.phone || '미입력',
        deliveryTime: deliveryTime,
        fullAddress: `(${currentUser.zipcode || '00000'}) ${currentUser.roadAddress || ''} ${currentUser.detailAddress || ''}`,
        items: cart.map(c => c.name).join(', '),
        totalPrice: total,
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
    alert(`🎉 마일리지 결제가 완료되었습니다!\n배송 희망시간[${deliveryTime}]에 맞춰 지정 주소로 안전하게 배송됩니다.`);
    switchTab(document.querySelectorAll('.nav-item')[5], 'mypage');
}

// 요구사항 7: 마이페이지 - 입금자 성함 및 계좌번호 입력 충전 신청
function renderMypage() {
    const container = document.getElementById('mypage-content');
    if (!currentUser) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <p style="color:#666; margin-bottom:20px;">로그인 후 개인정보 조회가 가능합니다.</p>
                <button class="btn-primary" style="max-width:220px;" onclick="openAuthModal()">로그인 / 정식 회원가입</button>
            </div>
        `;
        return;
    }

    const myOrders = orders.filter(o => o.userName === (currentUser.name || currentUser.username));
    const myRequests = chargeRequests.filter(r => r.username === currentUser.username);

    container.innerHTML = `
        <div style="background:var(--gray-bg); padding:20px; border-radius:12px; margin-bottom:25px;">
            <h3>👋 안녕하세요, <strong>${currentUser.name || currentUser.username}</strong>님!</h3>
            <p style="font-size:14px; color:#555; margin-top:8px;">📱 연락처: ${currentUser.phone} (비상: ${currentUser.emergencyPhone || '미입력'})</p>
            <p style="font-size:14px; color:#555;">🏠 배송지: (${currentUser.zipcode || '-'}) ${currentUser.roadAddress || ''} ${currentUser.detailAddress || ''}</p>
            <p style="font-size:16px; margin-top:10px;">💰 보유 마일리지: <strong style="color:var(--primary-color); font-size:20px;">${(currentUser.mileage || 0).toLocaleString()} P</strong></p>
        </div>

        <div style="background:#FFF; border:1px solid #E0E0E0; padding:20px; border-radius:12px; margin-bottom:30px;">
            <h3>💳 마일리지 계좌이체 충전 신청</h3>
            <p style="font-size:13px; color:#666; margin-bottom:12px;">입금 진행 후 신청해 주시면 관리자 입금 확인 후 마일리지가 승인 충전됩니다.</p>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                <input type="text" id="charge-depositor" class="form-control" placeholder="입금자 성함 *">
                <input type="text" id="charge-account" class="form-control" placeholder="입금한/입금할 계좌번호 *">
            </div>
            <div style="display:flex; gap:10px;">
                <select id="charge-amount-select" class="form-control" style="flex:1;">
                    <option value="10000">10,000원 (+500P 추가 적립)</option>
                    <option value="30000">30,000원 (+2,000P 추가 적립)</option>
                    <option value="50000">50,000원 (+5,000P 추가 적립)</option>
                </select>
                <button class="btn-primary" style="width:140px;" onclick="requestMileageCharge()">충전 신청하기</button>
            </div>

            <h4 style="margin-top:20px; margin-bottom:8px;">나의 충전 신청 및 승인 현황</h4>
            ${myRequests.length === 0 ? '<p style="font-size:13px; color:#888;">충전 신청 내역이 없습니다.</p>' : `
                <ul style="font-size:13px; line-height:1.8; color:#444;">
                    ${myRequests.map(r => `
                        <li>[${r.date}] ${r.amount.toLocaleString()}원 (입금자: ${r.depositor}) ➔ <strong>${r.status === 'approved' ? '<span style="color:green;">승인 완료</span>' : '<span style="color:orange;">관리자 입금 확인 대기중</span>'}</strong></li>
                    `).join('')}
                </ul>
            `}
        </div>

        <div>
            <h3>📦 나의 배달 주문 내역</h3>
            ${myOrders.length === 0 ? '<p style="color:#888; padding:20px 0;">주문 내역이 없습니다.</p>' : `
                <table>
                    <thead>
                        <tr>
                            <th>주문일시</th>
                            <th>배송시간</th>
                            <th>주문 상품</th>
                            <th>결제 금액</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myOrders.map(o => `
                            <tr>
                                <td>${o.date}</td>
                                <td>${o.deliveryTime}</td>
                                <td>${o.items}</td>
                                <td><strong>${o.totalPrice.toLocaleString()}원</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

function requestMileageCharge() {
    const depositor = document.getElementById('charge-depositor').value.trim();
    const account = document.getElementById('charge-account').value.trim();
    const amount = parseInt(document.getElementById('charge-amount-select').value);

    if (!depositor || !account) {
        alert('이체자 성함과 계좌번호를 모두 입력해 주세요.');
        return;
    }

    const newReq = {
        id: Date.now(),
        username: currentUser.username,
        name: currentUser.name || currentUser.username,
        depositor,
        account,
        amount,
        date: new Date().toLocaleString('ko-KR'),
        status: 'pending' // 승인 대기 상태
    };

    chargeRequests.unshift(newReq);
    localStorage.setItem('chargeRequests', JSON.stringify(chargeRequests));
    alert('🎉 마일리지 충전 신청이 완료되었습니다!\n관리자가 입금 확인 후 충전을 승인해 드립니다.');
    renderMypage();
}

// 요구사항 8, 10, 11: 최고 관리자 센터 제어, 가입자 정보, 마일리지 승인
function renderAdmin() {
    const tbody = document.getElementById('admin-order-list');
    const dishList = document.getElementById('admin-dish-manage-list');
    const userInfoList = document.getElementById('admin-user-info-list');
    const chargeReqList = document.getElementById('admin-charge-requests-list');

    if (!currentUser || currentUser.username !== 'admin') return;

    // 1) 반찬 삭제 관리
    dishList.innerHTML = dishes.map(d => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #EEE;">
            <span>[${d.category}] <strong>${d.name}</strong> (${d.price.toLocaleString()}원)</span>
            <button class="btn-header" style="padding:2px 8px; font-size:11px; color:red;" onclick="deleteDish(${d.id})">삭제</button>
        </div>
    `).join('');

    // 요구사항 11: 마일리지 충전 신청 승인/거절 처리
    const pendingReqs = chargeRequests.filter(r => r.status === 'pending');
    chargeReqList.innerHTML = pendingReqs.length === 0 
        ? '<p style="color:#888; font-size:13px;">현재 대기 중인 마일리지 충전 신청이 없습니다.</p>' 
        : pendingReqs.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed #CCC; font-size:14px;">
                <div>
                    <strong>${r.name} (${r.username})</strong> | 신청금액: <span style="color:#FF5722; font-weight:bold;">${r.amount.toLocaleString()}원</span><br>
                    <span style="font-size:12px; color:#666;">입금자명: ${r.depositor} | 계좌: ${r.account} | 일시: ${r.date}</span>
                </div>
                <div>
                    <button class="btn-primary" style="padding:4px 12px; font-size:12px; width:auto;" onclick="approveMileageCharge(${r.id})">입금확인 & 승인</button>
                </div>
            </div>
        `).join('');

    // 요구사항 10: 가입자 개인정보 (성함, 연락처, 비상연락처, 주소, 마일리지)
    userInfoList.innerHTML = users.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:#888;">가입된 회원이 없습니다.</td></tr>' : users.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.name}</td>
            <td>${u.phone}</td>
            <td>${u.emergencyPhone || '-'}</td>
            <td>(${u.zipcode || '-'}) ${u.roadAddress || ''} ${u.detailAddress || ''}</td>
            <td><strong style="color:var(--primary-color);">${(u.mileage || 0).toLocaleString()} P</strong></td>
        </tr>
    `).join('');

    // 4) 고객 주문 현황
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#888; padding:20px;">주문 내역이 없습니다.</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.date}</td>
            <td><strong>${o.userName}</strong></td>
            <td>${o.phone}</td>
            <td><strong style="color:#FF5722;">${o.deliveryTime || '미지정'}</strong></td>
            <td>${o.fullAddress}</td>
            <td>${o.items}</td>
            <td><strong>${o.totalPrice.toLocaleString()}원</strong></td>
        </tr>
    `).join('');
}

// 요구사항 11: 마일리지 승인 로직
function approveMileageCharge(reqId) {
    const req = chargeRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'approved';
    localStorage.setItem('chargeRequests', JSON.stringify(chargeRequests));

    // 해당 사용자에게 마일리지 부여
    const targetUser = users.find(u => u.username === req.username);
    if (targetUser) {
        targetUser.mileage = (targetUser.mileage || 0) + req.amount;
        localStorage.setItem('users', JSON.stringify(users));
        if (currentUser && currentUser.username === targetUser.username) {
            currentUser.mileage = targetUser.mileage;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }

    alert(`🎉 [${req.name}] 님의 ${req.amount.toLocaleString()}원 마일리지 충전이 승인되었습니다!`);
    renderAdmin();
}

function openAuthModal(signupMode = false) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'block';
    
    // 요구사항 1: 회원가입 클릭 시 이전 입력 내용 남지 않도록 폼 클리어
    clearAuthForm();

    if (signupMode) {
        isSignup = false;
        toggleAuthMode();
    }
}

// 요구사항 1: 폼 완벽 초기화
function clearAuthForm() {
    document.getElementById('auth-username').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-name').value = '';
    document.getElementById('auth-phone').value = '';
    document.getElementById('auth-emergency-phone').value = '';
    document.getElementById('auth-zipcode').value = '';
    document.getElementById('auth-road-address').value = '';
    document.getElementById('auth-detail-address').value = '';
    document.getElementById('auth-recommender').value = '';
}

function toggleAuthMode() {
    isSignup = !isSignup;
    clearAuthForm(); // 탭 전환 시에도 내용 초기화
    document.getElementById('auth-title').innerText = isSignup ? '정식 회원가입' : '로그인';
    document.getElementById('signup-extra-fields').style.display = isSignup ? 'block' : 'none';
    document.getElementById('auth-submit-btn').innerText = isSignup ? '가입 완료하기' : '로그인';
    document.getElementById('auth-toggle-text').innerText = isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 정식 회원가입';
}

function submitAuth() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!username || !password) {
        alert('아이디와 비밀번호를 입력해 주세요.');
        return;
    }

    if (isSignup) {
        const name = document.getElementById('auth-name').value.trim();
        const phone = document.getElementById('auth-phone').value.trim();
        const emergencyPhone = document.getElementById('auth-emergency-phone').value.trim();
        const zipcode = document.getElementById('auth-zipcode').value.trim();
        const roadAddress = document.getElementById('auth-road-address').value.trim();
        const detailAddress = document.getElementById('auth-detail-address').value.trim();
        const recommender = document.getElementById('auth-recommender').value.trim();

        if (!name || !phone || !roadAddress) {
            alert('성함, 연락처, 도로명 주소 필수 항목을 입력해 주세요.');
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
                alert(`🎁 추천인 [${recommender}]님이 확인되어 두 분 모두에게 1,000P가 추가 적립되었습니다!`);
            }
        }

        const newUser = {
            username,
            password,
            name,
            phone,
            emergencyPhone,
            zipcode,
            roadAddress,
            detailAddress,
            mileage: bonusMileage,
            isAdmin: false
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        alert(`🎉 회원가입을 축하합니다! (${bonusMileage.toLocaleString()} P 적립)`);
    } else {
        // 요구사항 8: admin 최고 관리자 계정 비밀번호 rlacksdn1! 설정
        if (username === 'admin' && password === 'rlacksdn1!') {
            currentUser = { username: 'admin', name: '최고 관리자', phone: '010-0000-0000', roadAddress: '본사', isAdmin: true, mileage: 999999 };
        } else {
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                alert('가입되지 않은 아이디이거나 비밀번호가 틀렸습니다.');
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