//宣告產品列表, 用querySelector抓DOM
const productList = document.querySelector(".productWrap");
//宣告篩選選單
const productSelect = document.querySelector(".productSelect");
//抓取shopping Cart Table Body的DOM
const shoppingCartTableBody = document.querySelector(".shoppingCart-table-body");

//網頁初始化
function init() {
  //函式包函式執行初始化
  getProductList();
  getCartList();
};

//執行初始化
init();

//產品列表
//宣告productData的空陣列，以getProductList的get語法抓取陣列資料並填入其中
let productData = [];
//宣告空字串以便組字串
let strProductCard = "";
//axios get取得產品列表的API
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/products`)
    .then(function (response) {
      //抓取data中的products陣列，並填入到上方的空陣列
      productData = response.data.products;
      renderProductList();
    })
};

//重複的內容結合
function combineProductHTMLItem(item) {
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="">
  <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${numberWithCommas(item.origin_price)}</del>
  <p class="nowPrice">NT$${numberWithCommas(item.price)}</p>
  </li>`
};


//渲染全部的條件
function renderProductList() {
  //已被填入陣列的資料，可以用forEach遍歷其中的資料
  productData.forEach(function (item) {
    //利用上方已宣告的空字串組字串
    strProductCard += combineProductHTMLItem(item);
  })
  //利用上方已宣告的productList(抓到的DOM)填入剛組好的字串(html標籤)
  productList.innerHTML = strProductCard;
};

//篩選功能
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  if (category == "全部") {
    renderProductList();
    return;
  };
  let strProductSelect = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      strProductSelect += combineProductHTMLItem(item);
    };
  })
  //利用上方已宣告的productList(抓到的DOM)填入剛組好的字串(html標籤)
  productList.innerHTML = strProductSelect;
});

//加入購物車
productList.addEventListener("click", function (e) {
  e.preventDefault();
  const addCartItem = e.target.getAttribute("class");
  if (addCartItem !== "addCardBtn") {
    return;
  };
  let productId = e.target.getAttribute("data-id");
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    };
  });
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/carts/`,
    {
      "data": {
        "productId": productId,
        "quantity": numCheck
      }
    })
    .then(function (response) {
      alert("成功加入購物車")
      getCartList();
    });
});

//刪除購物車
shoppingCartTableBody.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  };
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/carts/${cartId}`)
    .then(function (response) {
      alert("您已成功刪除商品!");
      getCartList();
    })
});

//刪除全部購物車
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/carts`)
    .then(function (response) {
      alert("刪除全部品項");
      getCartList();
    })
    .catch(function (error) {
      alert("您已刪除全部品項");
      getCartList();
    })
});

//取得購物車列表
let cartData = [];
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/carts`)
    .then(function (response) {
      //修改tfoot的總金額html內容
      document.querySelector(".js-total").textContent = numberWithCommas(response.data.finalTotal);
      //抓取data中的cart陣列，並填入到上方的空陣列
      cartData = response.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
      <td>
          <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
          </div>
      </td>
      <td>NT$${numberWithCommas(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${numberWithCommas(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
              clear
          </a>
      </td>
  </tr>`;
      })
      shoppingCartTableBody.innerHTML = str;
    })
};

//產生訂單
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData.length == 0) {
    alert("請加入商品至購物車");
    return;
  }
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == "") {
    alert("請輸入訂單資訊");
    return;
  };
  //e-mail驗證
  if (validateEmail(customerEmail)==false){
    alert("請填寫正確e-mail");
    return;
  };
  //手機號碼格式驗證
  if (validatePhone(customerPhone)==false){
    alert("請輸入正確手機號碼");
    return;
  };
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/nini1202desu/orders`, {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  })
    .then(function (response) {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    })
}
);

//validate.js
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "信箱": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};


inputs.forEach((item) => {
  item.addEventListener("click", function () {
    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';
    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`))
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
      })
    };
  });
});

//utilities.js 
//(千分位)
function numberWithCommas(n) {
  return n.toString().replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

//驗證e-mail
function validateEmail(mail){
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)){
    return true;
  }
    return false;
};

//驗證電話號碼
function validatePhone(phone){
  if (/^[09]{2}\d{8}$/.test(phone)){
    return true;
  }
  return false;
};