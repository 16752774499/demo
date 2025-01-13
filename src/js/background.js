/*
 * background.js为插件默认脚本
 *
 *
 *
 *
 * */


console.log("spider");
// chrome.action.onClicked.addListener(() => {
//     chrome.windows.create({
//         url: chrome.runtime.getURL('./src/html/sidebar.html'),
//         type: 'popup',
//         width: 800,
//         height: 600
//     });
// });


// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.action === "hidePopup") {
//         console.warn("接受到hidePopup信号");
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             console.warn("-----------------------------------------");
//             chrome.tabs.sendMessage(tabs[0].id, {action: "captureClick"});
//             console.warn("???????????????????????????????????????????");
//         });
//     } else if (request.action === "sendXPath") {
//         // 重新显示弹出页面并填充XPath
//         console.warn("555555555555555555555");
//         console.log(request.xpath);
//     }
// });


// 监听来自popup的消息，这里是保存原始窗口ID的逻辑
// var sidebarWindowId;
// var webWindowId;
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'openAndNavigate') {
//
//         chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//             if (tabs.length > 0) {
//                 sidebarWindowId = tabs[0].windowId;
//                 console.log("当前sidebar页面窗口ID：" + sidebarWindowId);
//                 console.log("当前页面窗口ID:", webWindowId);
//             }
//         });
//
//         // chrome.windows.getCurrent({}, function (currentWindow) {
//         //     // 保存当前窗口ID
//         //     //xpath输入框id
//         //     originalWindowId = currentWindow.id;
//         //     // 打开新窗口并导航到指定URL
//         //     //如果newWindowId为空，则打开新的窗口，
//         //     if (newWindowId === undefined) {
//         //         chrome.windows.create({url: request.url, type: 'popup'});
//         //     } else {
//         //         //不为空则跳转原来的窗口
//         //         // chrome.windows.update(newWindowId, { focused: true });
//         //         chrome.windows.get(newWindowId, {}, function (window) {
//         //             if (chrome.runtime.lastError) {
//         //                 // 如果有错误信息，通常意味着窗口不存在,重新创建
//         //                 console.warn("窗口不存在: ", chrome.runtime.lastError.message);
//         //                 chrome.windows.create({url: request.url, type: 'popup'});
//         //             } else {
//         //                 // 如果没有错误信息，窗口存在，加载窗口
//         //                 console.log("窗口存在，窗口信息: ", window);
//         //                 chrome.windows.update(newWindowId, {focused: true});
//         //             }
//         //         });
//         //
//         //
//         //     }
//         //
//         //
//         // });
//
//
//
//     }
// });

//


// background.js
var sidebarWindowId;
var webWindowId;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractedXPath') {
        console.log(request.xpath);

        // 逻辑处理XPath，例如发送到popup页面显示，或者存储起来
        chrome.runtime.sendMessage({ action: 'displayXPath', xpath: request.xpath });
        // 控制窗口跳转回原来的独立窗口页面
        getDataFromStorage("sidebarWindowId", function(result, error) {
            if (error) {
                // 如果发生错误
                console.error('Failed to retrieve sidebarWindowId:', error);
            } else if (result.sidebarWindowId !== undefined) {
                // 如果成功检索到数据
                chrome.windows.update(result.sidebarWindowId, { focused: true });
            } else {
                // 如果没有找到key为'webWindowId'的数据
                console.log('sidebarWindowId not found');
            }
        })

    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openAndNavigate') {
        console.log("接受到openAndNavigate");
        getDataFromStorage("webWindowId", function(result, error) {
            if (error) {
                // 如果发生错误
                console.error('Failed to retrieve webWindowId:', error);
            } else if (result.webWindowId !== undefined) {
                // 如果成功检索到数据
                chrome.windows.update(result.webWindowId, { focused: true });
            } else {
                // 如果没有找到key为'webWindowId'的数据
                console.log('webWindowId not found');
            }
        })
    }
});
//GetWindowID
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getWindowId") {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length > 0) {
                webWindowId = tabs[0].windowId;
                sendResponse({ windowId: tabs[0].windowId });
            } else {
                console.log("无法获取当前页面窗口ID");
            }
        });
        return true; // 表示你将异步响应消息
    }
});
//获取两个窗口id
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'webWindowId') {
        webWindowId = request.webWindowId;
        // console.log("webWindowId="+webWindowId);
        saveDataToStorage({ webWindowId: request.webWindowId }, function(success, error) {
            if (success) {
                console.log('webWindowId saved successfully');
            } else {
                console.error('Failed to save webWindowId:', error);
            }
        });
        getDataFromStorage(['webWindowId'], function(result, error) {
            if (error) {
                // 如果发生错误
                console.error('Failed to retrieve webWindowId:', error);
            } else if (result.webWindowId !== undefined) {
                // 如果成功检索到数据
                console.log('webWindowId:', result.webWindowId);
            } else {
                // 如果没有找到key为'webWindowId'的数据
                console.log('webWindowId not found');
            }
        });


    } else if (request.action === 'sidebarWindowId') {
        sidebarWindowId = request.sidebarWindowId;
        // console.log("sidebarWindowId="+sidebarWindowId);
        saveDataToStorage({ sidebarWindowId: request.sidebarWindowId }, function(success, error) {
            if (success) {
                console.log('sidebarWindowId saved successfully');
            } else {
                console.error('Failed to save sidebarWindowId:', error);
            }
        });
        getDataFromStorage(['sidebarWindowId'], function(result, error) {
            if (error) {
                // 如果发生错误
                console.error('Failed to retrieve sidebarWindowId:', error);
            } else if (result.sidebarWindowId !== undefined) {
                // 如果成功检索到数据
                console.log('sidebarWindowId:', result.sidebarWindowId);
            } else {
                // 如果没有找到key为'sidebarWindowId'的数据
                console.log('sidebarWindowId not found');
            }
        });
    }
});
// background.js
// chrome.windows.onRemoved.addListener(function (windowId) {
//     // 清除所有浏览数据
//     chrome.browsingData.remove({}, {
//         "appcache": true,
//         "cache": true,
//         "cookies": true,
//         "downloads": true,
//         "fileSystems": true,
//         "formData": true,
//         "history": true,
//         "indexedDB": true,
//         "localStorage": true,
//         "serverBoundCertificates": true,
//         "pluginData": true,
//         "passwords": true,
//         "webSQL": true
//     }, function () {
//         console.log('所有浏览数据已被清除。');
//     });
// });
function saveDataToStorage(data, callback) {
    chrome.storage.local.set(data, function() {
        if (chrome.runtime.lastError) {
            // 如果发生错误，打印错误信息
            console.error('Error saving data:', chrome.runtime.lastError);
            if (typeof callback === 'function') {
                callback(false, chrome.runtime.lastError);
            }
        } else {
            // 数据存储成功
            // console.log('Data saved successfully:', data);
            if (typeof callback === 'function') {
                callback(true);
            }
        }
    });
}

function getDataFromStorage(keys, callback) {
    chrome.storage.local.get(keys, function(result) {
        if (chrome.runtime.lastError) {
            // 如果发生错误，打印错误信息
            console.error('Error retrieving data:', chrome.runtime.lastError);
            if (typeof callback === 'function') {
                callback(null, chrome.runtime.lastError);
            }
        } else {
            // 检索数据成功
            // console.log('Data retrieved successfully:', result);
            if (typeof callback === 'function') {
                callback(result);
            }
        }
    });
}