window.onload = async function() {

    const openWindow_51job = document.getElementById("openWindow_51job");
    const openWindow_zhilian = document.getElementById("openWindow_zhilian");
    const openWindow_boss = document.getElementById("openWindow_boss");

    document.getElementById("jump").addEventListener("click", () => {
        window.open('https://www.51job.com/', '_blank');

        // 在新的窗口中打开第二个网页
        window.open('https://www.zhaopin.com/', '_blank');

        // 在新的窗口中打开第三个网页
        window.open('https://www.zhipin.com/', '_blank');
    });
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab.url)
        //域名
    const url = tab.url.split('//')[1].split('/')[0]
    document.getElementById("url_message").innerText = `当前页面域名:${url}`

    let page_url = tab.url;
    localStorage.setItem('page_url', page_url);
    console.log(localStorage.getItem('page_url'));
    popup_url = `./src/html/sidebar.html`;

    // 移除所有按钮的active类
    const resetButtonStyles = () => {
        openWindow_51job.classList.remove('active');
        openWindow_zhilian.classList.remove('active');
        openWindow_boss.classList.remove('active');
    };

    // chrome.runtime.sendMessage({action: 'page_url', url:tab.url);
    chrome.runtime.sendMessage({ action: 'page_url', url: tab.url });

    // 重置所有按钮样式
    resetButtonStyles();

    if (url === "we.51job.com") {
        openWindow_51job.classList.add('active');
        openWindow_51job.addEventListener('click', function() {
            chrome.windows.create({
                url: chrome.runtime.getURL(popup_url),
                type: 'popup',
                width: 800,
                height: 600
            });
        });
    }
    //https://www.zhipin.com/c101110100-p100101/
    else if (url === "www.zhipin.com") {
        let item1 = page_url.split('0')[0];
        let item2 = page_url.split('?')[0];
        if (item1 === "https://www.zhipin.com/c1" || item2 === "https://www.zhipin.com/web/geek/job") {
            openWindow_boss.classList.add('active');
            openWindow_boss.addEventListener('click', function() {
                chrome.windows.create({
                    url: chrome.runtime.getURL(popup_url),
                    type: 'popup',
                    width: 800,
                    height: 600
                });
            });
        }
    } else if (url + "/sou" === "www.zhaopin.com/sou" && page_url !== "https://www.zhaopin.com/") {
        openWindow_zhilian.classList.add('active');
        openWindow_zhilian.addEventListener('click', function() {
            chrome.windows.create({
                url: chrome.runtime.getURL(popup_url),
                type: 'popup',
                width: 800,
                height: 600
            });
        });
    }
}


// chrome.tabs.getSelected(null,function (tab){
//     chrome.tabs.sendMessage(tab.id)
// })