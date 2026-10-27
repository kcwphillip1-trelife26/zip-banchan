const defaultDishes = [
    { id: 1, name: "한돈 돼지 수육 & 겉절이", price: 12000, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "시골 돼지 김치찌개 (2인분)", price: 8500, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "영양 만점 콩자반 & 시금치 나물", price: 4500, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "수제 한방 족발 세트", price: 16000, img: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=300&q=80" }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('users')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = [];
let dishes = JSON.parse(localStorage.getItem('dishes')) || defaultDishes;
let isSignup = false;

function init() {
    renderHeader();
    renderMenu();
    renderCart();
    renderAdmin();
}

function switchTab(el, sectionId) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'none';

    if(el) el.classList.add('active');
    document.getElementById(sectionId).classList.add('active');
}

function renderHeader() {
    const userHeader = document.getElementById('user-header');
    const adminNav = document.getElementById('admin-nav');

    if (currentUser) {
        userHeader.innerHTML = `
            <span><strong>${currentUser.name || currentUser.username}</strong>님 (${(currentUser.mileage || 0).toLocaleString()} P)</span>
            <button class="btn-sm" onclick="logout()">로그아웃</button>
        `;
        adminNav.style.display = currentUser.isAdmin ? 'block' : 'none';
        document.getElementById('user-mileage-display').innerText = (currentUser.mileage || 0).toLocaleString() + ' P';
    } else {
        userHeader.innerHTML = `<button class="btn-sm" onclick="openAuthModal()">로그인 / 회원가입</button>`;
        adminNav.style.display = 'none';
    }
}

function renderMenu() {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = dishes.map(d => `
        <div class="menu-card">
            <img src="${d.img}" class="menu-img" id="img-preview-${d.id}">
            <div class="menu-details">
                <div class="menu-title">${d.name}</div>
                <div class="menu-price">${d.price.toLocaleString()}원</div>
                <label style="font-size:11px; color:#666; cursor:pointer; display:block; margin-bottom:8px;">
                    🖼️ 이미지 파일 변경 <input type="file" accept="image/*" style="display:none" onchange="uploadImage(event, ${d.id})">
                </label>
                <button class="btn-add" onclick="addToCart(${d.id})">장바구니 담기</button>
            </div>
        </div>
    `).join('');
}

function uploadImage(e, dishId) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const dish = dishes.find(d => d.id === dishId);
            dish.img = evt.target.result;
            localStorage.setItem('dishes', JSON.stringify(dishes));
            renderMenu();
        };
        reader.readAsDataURL(file);
    }
}

function addToCart(dishId) {
    const dish = dishes.find(d => d.id === dishId);
    cart.push(dish);
    document.getElementById('cart-count').innerText = cart.length;
    alert(`${dish.name}이(가) 장바구니에 담겼습니다.`);
    renderCart();
}

function renderCart() {
    const list = document.getElementById('cart-list');
    if (cart.length === 0) {
        list.innerHTML = `<p style="color:#888; padding: 20px 0;">장바구니가 비어 있습니다.</p>`;
        document.getElementById('cart-total-price').innerText = '0';
        return;
    }

    let total = 0;
    list.innerHTML = cart.map(item => {
        total += item.price;
        return `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #ddd;">
            <span>${item.name}</span>
            <strong>${item.price.toLocaleString()}원</strong>
        </div>`;
    }).join('');
    document.getElementById('cart-total-price').innerText = total.toLocaleString();
}

function chargeMileage() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        openAuthModal();
        return;
    }
    const amt = parseInt(document.getElementById('charge-amount').value);
    currentUser.mileage = (currentUser.mileage || 0) + amt;
    updateUserData();
    alert(`${amt.toLocaleString()} 마일리지가 충전되었습니다!`);
    renderHeader();
}

function placeOrder() {
    if (!currentUser) {
        alert('로그인 후 주문 가능합니다.');
        openAuthModal();
        return;
    }
    if (cart.length === 0) {
        alert('장바구니가 비어 있습니다.');
        return;
    }
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    if ((currentUser.mileage || 0) < total) {
        alert('마일리지가 부족합니다. 마일리지를 충전해 주세요!');
        switchTab(document.querySelectorAll('.nav-item')[4], 'mileage');
        return;
    }

    currentUser.mileage -= total;
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleString('ko-KR'),
        userName: currentUser.name || currentUser.username,
        phone: currentUser.phone || '미입력',
        address: currentUser.address || '미입력',
        items: cart.map(c => c.name).join(', '),
        totalPrice: total
    };

    orders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    updateUserData();

    cart = [];
    document.getElementById('cart-count').innerText = '0';
    renderCart();
    renderHeader();
    renderAdmin();
    alert('🎉 아침 배달 주문이 완료되었습니다! 내일 아침 7시 전 지정된 장소로 배달됩니다.');
}

function renderAdmin() {
    const tbody = document.getElementById('admin-order-list');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888;">주문 내역이 없습니다.</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>${o.date}</td>
            <td><strong>${o.userName}</strong></td>
            <td>${o.phone}</td>
            <td>${o.address}</td>
            <td>${o.items}</td>
            <td>${o.totalPrice.toLocaleString()}원</td>
        </tr>
    `).join('');
}

function openAuthModal() {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('auth-modal').style.display = 'block';
}

function toggleAuthMode() {
    isSignup = !isSignup;
    document.getElementById('auth-title').innerText = isSignup ? '회원가입' : '로그인';
    document.getElementById('signup-extra-fields').style.display = isSignup ? 'block' : 'none';
    document.getElementById('auth-submit-btn').innerText = isSignup ? '가입하기' : '로그인';
    document.getElementById('auth-toggle-text').innerText = isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입';
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
            address: document.getElementById('auth-address').value || '기본 주소',
            mileage: 0,
            isAdmin: username === 'admin'
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        alert('회원가입이 완료되었습니다!');
    } else {
        if(username === 'admin' && password === '1234') {
            currentUser = { username: 'admin', name: '관리자', isAdmin: true, mileage: 999999 };
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
    renderHeader();
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
    renderHeader();
    switchTab(document.querySelectorAll('.nav-item')[0], 'intro');
}

init();