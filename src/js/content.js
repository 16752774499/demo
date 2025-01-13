var currentPageUrl = window.location.href;


// https://www.zhipin.com/web/geek/job?query=Java&city=101110100
var domain_name = currentPageUrl.split('//')[1].split('/')[0];

var zhipin_domain_name = currentPageUrl.split("//")[1].split("?")[0];

//https://www.zhaopin.com/sou/jl489/p1
var zhaopin_domain_name = currentPageUrl.split("//")[1].split('/sou')[0] + '/sou';

let webWindowId;

window.onload = async function() {
    //获取web页面id
    chrome.runtime.sendMessage({ action: "getWindowId" }, function(response) {
        webWindowId = response.windowId;
        console.log("当前web窗口ID:", response.windowId);
        chrome.runtime.sendMessage({ action: 'webWindowId', webWindowId: webWindowId });
    });
    alert("鼠标点击事件已禁用！,点击页面元素获取xpath！");
    // 调用异步函数
    asyncTimer();
}


if (zhaopin_domain_name === "www.zhaopin.com/sou" || domain_name === "we.51job.com" || zhipin_domain_name === "www.zhipin.com/web/geek/job") {


    console.log("进入工作页面");

    document.addEventListener('click', function(event) {


        event.preventDefault();
        event.stopPropagation();

        console.log("禁用点击事件!");

        let xpathData = getElementXPath(event.target);
        chrome.runtime.sendMessage({
            action: 'extractedXPath',
            xpath: xpathData // 直接传递包含xpath和text的对象
        });
        console.log(xpathData);
        return false;
    }, true);


}


// 辅助函数：获取元素的同级索引
function getSiblingIndex(element) {
    let index = 1; // XPath索引从1开始
    let sibling = element.previousElementSibling;
    while (sibling) {
        if (sibling.tagName === element.tagName) {
            index++;
        }
        sibling = sibling.previousElementSibling;
    }
    return index;
}

// 主函数：获取元素的XPath和文本内容
function getElementXPath(element) {
    if (element.id !== '') {
        return {
            xpath: `id("${element.id}")`,
            text: element.textContent || ''
        };
    }
    if (element === document.body) {
        return {
            xpath: element.tagName.toLowerCase(),
            text: element.textContent || ''
        };
    }

    const siblingIndex = getSiblingIndex(element);
    const pathToParent = getElementXPath(element.parentNode).xpath;
    const tagName = element.tagName.toLowerCase();

    return {
        xpath: `${pathToParent}/${tagName}[${siblingIndex}]`,
        text: element.textContent || ''
    };
}


function getElementXpath(element) {
    if (element.id !== '') {
        // 使用id作为XPath的快捷方式
        return `id("${element.id}")`;
    }
    // 对于body或html元素，直接返回标签名
    if (element === document.body) {
        return '/html/body';
    } else if (element === document.documentElement) {
        return '/html';
    } else {
        // 递归地构建XPath
        const ix = [...element.parentNode.children].indexOf(element) + 1; // 获取同级元素的索引
        const tagName = element.tagName.toLowerCase(); // 获取标签名
        return `${getElementXpath(element.parentNode)}/${tagName}[${ix}]`;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 异步函数，执行定时操作
async function asyncTimer() {
    console.log('Start');

    // 设置异步定时器为 3 秒
    await delay(5000);
    var elements = document.querySelectorAll('div.icon_promotion');

    // 遍历所有匹配的元素并移除它们
    elements.forEach(function(element) {
        element.remove();
    });
    console.log('After 5 seconds');

    // 继续执行其他操作
    console.log('End');
    alert("页面元素已调整！")
}


// id("positionList-hook")/div[1]/div[1]/div[1]/div[1]/div[1]/a[1]
// id("positionList-hook")/div[1]/div[1]/div[1]/div[1]/div[1]/a[1]