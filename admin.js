
//抓取orderList DOM
const orderList = document.querySelector(".js-orderlist");
let orderData = [];
//初始化
function init() {
    getOrderList();
};
init();
//產生產品列表
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/nini1202desu/orders`, {
        headers: {
            'Authorization': 'FYBPUXXUDiRDleRiueVDZ96EKZy2',
        }
    })
        .then(function (response) {
            orderData = response.data.orders;
            let str = "";
            orderData.forEach(function (item) {
                //組訂單日期字串
                let timeStamp = new Date(item.createdAt * 1000);
                let orderDate = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
                //組產品字串
                let strProduct = "";
                item.products.forEach(function (productItem) {
                    strProduct += `<p>${productItem.title}x${productItem.quantity}</p>`;
                });
                //判斷訂單狀態
                let newStatus = "";
                if (item.paid == true) {
                    newStatus = "已處理";
                } else {
                    newStatus = "未處理";
                };
                //組產品列表字串
                str += `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${strProduct}
            </td>
            <td>${orderDate}</td>
            <td class="orderStatus">
                <a href="#" class="js-orderStatus" data-id="${item.id}" data-status="${item.paid}">${newStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
            </td>
        </tr>`;
            })
            orderList.innerHTML = str;
            //renderC3();
            renderC3_Lv2();
        })
};


//訂單狀態按鈕監聽
orderList.addEventListener("click", function (e) {
    e.preventDefault();
    let targetClass = e.target.getAttribute("class");
    if (targetClass == "js-orderStatus") {
        let status = e.target.getAttribute("data-status");
        let id = e.target.getAttribute("data-id");
        amendOrderItem(status, id);
        return;
    };

    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        let id = e.target.getAttribute("data-id");
        deleteOrderItem(id);
        return;
    }
});

//修改訂單狀態
function amendOrderItem(status, id) {
    let newOrderStatus;
    if (status == true) {
        newOrderStatus = false;
    } else {
        newOrderStatus = true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/nini1202desu/orders`, {
        "data": {
            "id": id,
            "paid": newOrderStatus
        }
    },
        {
            headers: {
                'Authorization': 'FYBPUXXUDiRDleRiueVDZ96EKZy2',
            }
        }).then(function (response) {
            alert("修改訂單狀態成功");
            return;
        })
    getOrderList();
};

//刪除單筆訂單
function deleteOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/nini1202desu/orders/${id}`, {
        headers: {
            'Authorization': 'FYBPUXXUDiRDleRiueVDZ96EKZy2',
        }
    }).then(function (response) {
        alert("刪除訂單成功");
        return;
    })
    getOrderList();
};

//刪除全部訂單
const deleteAllOrder = document.querySelector(".discardAllBtn");
deleteAllOrder.addEventListener("click", function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/nini1202desu/orders`, {
        headers: {
            'Authorization': 'FYBPUXXUDiRDleRiueVDZ96EKZy2',
        }
    }).then(function (response) {
        alert("成功刪除全部訂單");
        getOrderList();
    })
});

//C3圖表
function renderC3() {
    let total = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (total[productItem.category] === undefined) {
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {
                total[productItem.category] += productItem.price * productItem.quantity;
            };
        });
        //取物件屬性變為陣列, 做出資料關聯     
        let categoryAry = Object.keys(total);
        let newData = [];
        categoryAry.forEach(function (item) {
            let ary = [];
            ary.push(item); //推category
            ary.push(total[item]); //推金額
            newData.push(ary); //將ary推入newData空陣列中
        })
        //c3.js
        let chart = c3.generate({
            bindto: '#chart', // HTML 元素綁定
            data: {
                type: "pie",
                columns: newData,
                colors: {
                    "床架": "#DACBFF",
                    "收納": "#9D7FEA",
                    "窗簾": "#5434A7",
                    "其他": "#301E5F",
                }
            },
        });
    })
};

//C3 LV2圖表
function renderC3_Lv2(){
    //資料蒐集
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (obj[productItem.title] === undefined){
                obj[productItem.title] = productItem.price * productItem.quantity;
            }else {
                obj[productItem.title] += productItem.price * productItem.quantity;
            };
        })
    });

    //資料關聯
    let titleAry = Object.keys(obj);
    //統整成C3要的陣列格式
    let salesSortAry = [];
    titleAry.forEach(function(item){
        let ary = [];
        ary.push(item); //商品名稱
        ary.push(obj[item]); //商品總金額
        salesSortAry.push(ary);
    });

    //排序
    salesSortAry.sort(function(a, b){
      return b[1]-a[1];
    });

    //如超過4筆以上, 就統整為其他項目
    if (salesSortAry.length>3){
        let otherTotal = 0;
        salesSortAry.forEach(function(item, index){
         if (index>2){
            otherTotal+=salesSortAry[index][1];
         };
        })
        salesSortAry.splice(3, salesSortAry.length-1);
        salesSortAry.push(["其他", otherTotal]);
    };
    
    //C3圖表
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: salesSortAry,
            colors: {
                "Charles 雙人床架": "#DACBFF",
                "Jordan 雙人床架／雙人加大": "#9D7FEA",
                "Antony 床邊桌": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
};