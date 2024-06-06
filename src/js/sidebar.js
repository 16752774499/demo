window.onload = async function () {

    var sidebarWindowId;

    let DataList = [];


    console.log(Host_Port);

    const inputElement = document.getElementById('input3');
    //从cookie中获取url
    inputElement.value = localStorage.getItem('page_url');
    const xpathInput = document.getElementById('xpathInput');
    const submitInput = document.getElementById("submitInput");
    const input1 = document.getElementById("input1");

    //域名
    const domain_name = localStorage.getItem('page_url').split('//')[1].split('/')[0];


    //设置xpathInput只读属性
    // 设置<input>为只读
    xpathInput.setAttribute('readonly', true);

// 阻止剪切和粘贴
    xpathInput.addEventListener('cut', function (event) {
        event.preventDefault();
    });

    xpathInput.addEventListener('paste', function (event) {
        event.preventDefault();
    });


    xpathInput.addEventListener('click', () => {
        console.log("11111111111111111111111");
        chrome.runtime.sendMessage({action: 'openAndNavigate'});
    });


    chrome.runtime.sendMessage({action: "getWindowId"}, function (response) {
        sidebarWindowId = response.windowId;
        console.log("当前sidebar窗口ID:", response.windowId);
        chrome.runtime.sendMessage({action: 'sidebarWindowId', sidebarWindowId: sidebarWindowId});
    });

//html/body/div/div[4]/div[2]/div[2]/div/div[1]/div[1]/div[1]/div[1]/p
//html/body/div/div[4]/div[2]/div[2]/div/div[2]/div[1]/div[1]/div[1]/p
//id(\"positionList-hook\")/div[1]/div[1]/div[1]/div[1]/div[1]/a[1]
//id(\"positionList-hook\")/div[1]/div[3]/div[1]/div[1]/div[1]/a[1]
// *[@id="positionList-hook"]/div/div[2]/div[1]/div[1]/div[1]/a

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'displayXPath') {

            let remove_symbol_text = removePunctuationAndSpaces(request.xpath.text);
            // 输出到input.value
            if (xpathInput.value === '') {
                //判空
                if (request.xpath.text !== "") {
                    xpathInput.value = remove_symbol_text;
                    DataList.push(request.xpath);
                } else {
                    alert("该条数据为空！");
                }

            } else {
                // 如果不为空，则在尾部添加数据
                if (request.xpath.text !== "") {
                    xpathInput.value += '\n' + remove_symbol_text;
                    DataList.push(request.xpath);
                } else {
                    alert("该条数据为空！");
                    console.log(DataList);
                }

            }


        }
    });


    // if (!isInputEmpty(document.getElementById("xpathInput"))) {
    //     //xpathInput不为空添加新的xpath输入框
    //     //目标元素
    //     console.error(1111);
    //     const targetElement = document.getElementById('xpathInput')
    //     targetElement.insertAdjacentHTML('beforeend', `<div class="form-group">\n' +
    //         '            <label for="xpathInput">需要采集的Xpath</label>\n' +
    //         '            <input type="text" id="xpathInput" name="input2">\n' +
    //         '\n' +
    //         '        </div>`);
    // }else {
    //     return null;
    // }
    //submitInput点击事件
    submitInput.addEventListener('click', function () {
        let formData = new FormData();

        formData.append("domain_name", domain_name);
        formData.append('url', inputElement.value);
        formData.append('page_num', input1.value);
        formData.append('DataList', JSON.stringify(DataList)); // 将对象转换为JSON字符串
        console.log(formData);

        // 获取inputElement和input1中的值
        // 阻止表单默认提交行为
        event.preventDefault();
        // 创建一个FormData对象

        // 使用axios发起请求
        axios({
            timeout: 0,
            method: 'post',
            url: `${Host_Port}/browser_args`, // 替换为你的目标URL
            data: formData,
            headers: {'Content-Type': 'multipart/form-data'}
        })
            .then(function (response) {
                console.log('Response:', response.data);
                // 获取 body 元素
                var body = document.body;
                // 移除 body 内的所有子元素
                while (body.firstChild) {
                    body.removeChild(body.firstChild);
                }
                console.log(typeof response.data);
                firstList = response.data["page_1"]["dom_1"];


                let head_body = "<button id=\"backButton\" class=\"backButton\">返回</button><div class=\"container\">";
                let middle_body = "";
                middle_body += `<input id="inputFileName" type=\"text\" placeholder=\"FileName\">`
                firstList.forEach(function (element) {
                    middle_body += `<div class=\"textbox\">${element}</div>\n" +
                        "    <input id="inputKey" type=\"text\" placeholder=\"Enter Key\">`
                });
                let end_body = "<br>\n" +
                    "    <br>\n" +
                    "    <button id='saveJson'>保存json</button>\n" +
                    "    <button id='saveExcel'>保存excel</button>";
                document.body.innerHTML = head_body + middle_body + end_body;


                document.getElementById("saveJson").addEventListener("click", () => {
                    CombinedData(response.data);
                    let SendData = {
                        data: Data
                    }
                    // console.log(SendData);
                    SaveJson(SendData);
                    //     保存到本地与服务器
                });
                document.getElementById("saveExcel").addEventListener("click", () => {
                    CombinedData(response.data);
                    let SendData = {
                        data: Data
                    }
                    // console.log(SendData);
                    SaveExcel(SendData);
                    //     保存到本地与服务器
                });
                document.getElementById("backButton").addEventListener("click", () => {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        // 重新加载当前标签页
                        chrome.tabs.reload(tabs[0].id);
                    });
                });

            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    });
};

const Data = [];


//判断input.value是否为空
function isInputEmpty(inputElement) {
    return inputElement.value.trim() === '';
}

//去除文本中的空格
function removePunctuationAndSpaces(text) {
    // 检查文本的开始和结束是否都是数字
    if (!/^\d.*\d$/.test(text)) {
        // 如果两端不都是数字，则移除标点符号和空格
        var punctuationAndSpacesRegex = /[\s]+/ug;
        text = text.replace(punctuationAndSpacesRegex, '');
    }
    // 如果文本两端都是数字，或者已经移除了标点符号和空格，返回处理后的文本
    return text;
}

//

function SaveJson(SendData) {

    // 本地保存
    let json = JSON.stringify(SendData);
    let blob = new Blob([json], {type: 'application/json'});
    let url = URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.href = url;
    let fileName = document.getElementById("inputFileName").value;
    if (fileName === "") {
        fileName = "data"
    }
    a.download = fileName + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    let fromData = {
        filename: fileName,
        data: json
    }
    //服务器保存
    axios({
        timeout: 0,
        method: 'post',
        url: `${Host_Port}/saveJson`, // 替换为你的目标URL
        data: fromData,
        headers: {'Content-Type': 'multipart/form-data'}
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function SaveExcel(SendData) {
    let table = [];
    let fileName = document.getElementById("inputFileName").value;
    if (fileName === "") {
        fileName = "data"
    }
    console.log("SaveExcel");
    // 处理表头
    getInputValues().forEach((item) => {
        if (item !== "") {
            table.push(item);
        } else {
            table.push("Key" + getInputValues().indexOf(item));
        }
    })
    console.log(SendData.data);
    SendData.data.forEach((item) => {
        let temp = []
        for (let i = 0; i < item.length; i++) {
            // console.log(item[i].Value);
            temp.push(item[i].Value)
        }
        table.push(temp);
    });

    table.push(table);
    console.log(table);
    let workbook = new ExcelJS.Workbook();

// 添加一个工作表
    let worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRows(table);

// 保存 Excel 文件
    workbook.xlsx.writeBuffer()
        .then(function (buffer) {
            // 将生成的 Excel 文件保存为 Blob 对象
            var blob = new Blob([buffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});

            // 创建下载链接并设置文件名
            var downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.download = fileName;

            // 点击下载链接触发下载
            downloadLink.click();
        })
        .catch(function (error) {
            console.log('保存 Excel 文件时出错:', error);
        });

}

//合并服务器value与页面输入的key
function CombinedData(serverData) {
    traverseObject(serverData);
}


function getInputValues() {
    const inputValues = [];
    // 获取所有 class 属性为 "inputKey" 的 input 输入框
    const inputElements = document.querySelectorAll('input[id="inputKey"]');

    // 遍历每个 input 输入框并输出其值
    inputElements.forEach(function (inputElement) {
        inputValues.push(inputElement.value);
    });
    return inputValues;
}


// 递归遍历对象
function traverseObject(obj) {
    let post = [];
    for (let key in obj) {
        if (typeof obj[key] === 'object') {
            traverseObject(obj[key]); // 递归调用自身遍历嵌套对象
        } else {
            // console.log(getInputValues()[Number(key)] + ":" + key + ': ' + obj[key]); // 输出键值
            let Key = getInputValues()[Number(key)];
            let Value = obj[key];
            if (Key === "") {
                Key = "key" + (Number(key) + 1);
            }
            post[Number(key)] = {
                Key, Value
            };


        }
    }
    if (post.length !== 0) {
        Data.push(post)
    }


}






