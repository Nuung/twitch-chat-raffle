'use strict';

//-------------------------------------------------------------------------------------------//
/* Static Dom Object area */
const sidebarCollapse = document.getElementById("sidebarCollapse");
const siteMenu = document.querySelectorAll(".site_menu");
const topButton = document.getElementById("topBtn");
const excluderBtn = document.querySelectorAll(".btn-excluder");
const nikeUpcomingText = document.getElementById("nike_upcoming_term_data");
const nikeUpcomingBtn = document.getElementById("nike_upcoming_term_update_btn");
const restockCheckDelBtn = document.getElementsByClassName("restock-list-delete");

// others -> insta 관련 
const otherInstaAddTxt = document.getElementById("other-insta-add-txt");
const otherInstaAddBtn = document.getElementById("other-insta-add-btn");



//-------------------------------------------------------------------------------------------//
/* Function List area */

// all-about scroll function 
function scrollFunction() {
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) topButton.style.display = "block";
    else topButton.style.display = "none";
}

// When the user clicks on the button, scroll to the top of the document
function toTopFunction(targetDom, duration) {
    let currentY = window.pageYOffset;
    const step = duration / currentY > 1 ? 10 : 100;
    const timeStep = duration / currentY * step;
    const intervalID = setInterval(() => {
        currentY = window.pageYOffset;
        if (currentY === 0) clearInterval(intervalID);
        else scrollBy(0, -step);
    }, timeStep);
}

// TargetDom 에 enter key event 추가하기 -> next function 실행
const enterKeyEvent = (targetDom, next) => {
    targetDom.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') next();
    });
}

// // Html Target특수문자 이스케이핑!
// const escapeHtml = (string) => {
//     return String(string).replace(/[&<>"'`=\/]/g, '');
// };

// Nike upcoming get term
const getNikeUpcoming = () => {
    $.ajax({
        type: "GET",
        url: "/nike/upcoming",
        dataType: "json",
        success: function (result) {
            nikeUpcomingText.value = JSON.parse(result)['term'];
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Get Nike Upcoming Fail", e['error'], "error");
        }
    });
};

// Nike upcoming update term
const updateNikeUpcoming = () => {
    const term = nikeUpcomingText.value;

    // data check
    if (term == null || term == "" || term == " ") {
        swal("Update Fail", `${term} 은 잘 못 된 데이터 입니다. 공백은 허용하지 않습니다.`, "error");
        return;
    }

    $.ajax({
        type: "POST",
        url: "/nike/upcoming",
        dataType: "json",
        data: {
            term: term
        },
        success: function (result) {
            swal("Update Success", result['message'], "success");
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Update Fail", e['error'], "error");
        }
    }); // ajax
};

// Excluder ~ DB 지우는 Function 
const excluderEvent = (event) => {
    let destinationUrl = "";
    const target = event.target.getAttribute('data-target');
    const dump_target = event.target.getAttribute('dump-target'); // for dump_logs Collection 

    if (dump_target) destinationUrl = "/dumps";
    else destinationUrl = "/size_check/drop";

    $.ajax({
        type: "DELETE",
        url: destinationUrl,
        dataType: "json",
        data: { target: target, dump_target: dump_target },
        success: function (result) {
            swal("Excluder Success", `${result['message']} 성공!`, "success");
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Fail", `${e['responseJSON']['message']}!`, "error");
        }
    }); // ajax    
};

//-------------------------------------------------------------------------------------------//
/* Updated Restock Management Function List area */

// 추가된 메뉴에 이벤트 추가해주기! 
const restockNavRender = (site, groupListMap) => {

    // clean up restock nav group list (새로 랜더링 해주기 위해서)
    if ($(`#${site}-restock-group`).find('li').length > 1) {
        const arr_remove = $(`#${site}-restock-group`).find('li');
        for (let index = 1; index < arr_remove.length; index++) {
            arr_remove[index].remove();
        }
    }

    // append group list
    for (const [key, value] of groupListMap) {
        $(`#${site}-restock-group`).append(`<li class="nav-item nav-link" target-group="${site}-restock-list-group-${key}">${key}(${value})</li>`);
    }

    // add group list event
    $(`#${site}-restock-group > li`).on('click', function () {

        // active class list toggle
        const arr_remove = $(`#${site}-restock-group`).find('li');
        for (let index = 0; index < arr_remove.length; index++) arr_remove[index].classList.remove('active');
        this.classList.add('active');


        const targetRestockList = this.getAttribute('target-group');

        // 일단 모든 리스탁 리스트 display none하고, 타겟 그룹들만 디스플레잉
        const tempTargets = $(`#${site}-restock-list-body`).find('tr');
        for (let i = 0; i < tempTargets.length; i++) $(tempTargets[i]).hide();

        if (targetRestockList === `${site}-restock-list-group-all`) {
            const displayTargets = $(`#${site}-restock-list-body`).find('tr');
            for (let i = 0; i < displayTargets.length; i++) {
                $(displayTargets[i]).show();
            }
        }
        else {
            const displayTargets = $(`#${site}-restock-list-body`).find(`.${targetRestockList}`);
            for (let i = 0; i < displayTargets.length; i++) {
                $(displayTargets[i]).show();
            }
        }
    });
};

// ${site}-restock-list-group (그룹 input but readOnly 인 것에 그룹 편집 기능 이벤트)
const restockGroupUpdate = (site) => {
    const restockLists = document.getElementsByClassName(`${site}-restock-list-group`);
    for (const list of restockLists) {
        list.addEventListener('dblclick', (event) => {
            event.target.readOnly = false;
        });

        list.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {

                // data check
                if (event.target.value == null || event.target.value == "" || event.target.value == " ") {
                    swal("Update Fail", `${event.target.value} 은 잘 못 된 데이터 입니다. 공백은 허용하지 않습니다.`, "error");
                    return;
                }

                event.target.readOnly = true;

                // request to 
                if (site === "others") {
                    $.ajax({
                        type: "PUT",
                        url: `/${site}/restock/hook`,
                        dataType: "json",
                        data: {
                            hook_url: event.target.value.trim().replace(" ", ""),
                            target: event.target.getAttribute('target-info')
                        },
                        beforeSend: function () { }, // add loading image
                        complete: function () { }, // delete loading image
                        success: function (result) {
                            swal("Hook Url Updated Success", result['result'], "success");
                        },
                        error: function (e) {
                            console.log("ERROR : ", e);
                            swal("Update Fail", `${site} 인스타 훅 url 업데이트 에러: ${e['result']}`, "error");
                        }
                    });
                }
                else {
                    $.ajax({
                        type: "PUT",
                        url: `/${site}/restock/group`,
                        dataType: "json",
                        data: {
                            group: event.target.value,
                            target: event.target.getAttribute('target-info')
                        },
                        beforeSend: function () { }, // add loading image
                        complete: function () { }, // delete loading image
                        success: function (result) {
                            swal("Group Updated Success", result['result'], "success");
                        },
                        error: function (e) {
                            console.log("ERROR : ", e);
                            swal("Update Fail", `${site} 리스탁 링크 그룹 업데이트 에러: ${e['result']}`, "error");
                        }
                    });
                }
            }
        });
    }
};

// "other-insta-list-hook-title" => hook title info save and update
const instaHookTitleUpdate = () => {
    const instaHookTitleLists = document.getElementsByClassName(`other-insta-list-hook-title`);
    for (const list of instaHookTitleLists) {
        list.addEventListener('dblclick', (event) => {
            event.target.readOnly = false;
        });

        list.addEventListener('keyup', (event) => {

            // data check
            if (event.target.value == null || event.target.value == "" || event.target.value == " ") {
                swal("Update Fail", `${event.target.value} 은 잘 못 된 데이터 입니다. 공백은 허용하지 않습니다.`, "error");
                return;
            }

            if (event.key === 'Enter') {
                $.ajax({
                    type: "PUT",
                    url: `/others/restock/title`,
                    dataType: "json",
                    data: {
                        hook_title: event.target.value,
                        target: event.target.getAttribute('target-info')
                    },
                    beforeSend: function () { }, // add loading image
                    complete: function () { }, // delete loading image
                    success: function (result) {
                        swal("Hook Title Updated Success", result['result'], "success");
                    },
                    error: function (e) {
                        console.log("ERROR : ", e);
                        swal("Update Fail", `others 인스타 훅 title 업데이트 에러: ${e['result']}`, "error");
                    }
                });
            }
        })
    }
}

// ${site}-restock-on-off (토글 버튼) class 전용 이벤트 
const restockToggleEvent = (site) => {
    $(`.${site}-restock-on-off`).change(function () {
        const isOn = $(this).prop('checked');
        const targetInfo = this.getAttribute('target-info');

        // request to 
        $.ajax({
            type: "PUT",
            url: `/${site}/restock`,
            dataType: "json",
            data: {
                status: isOn,
                target: targetInfo
            },
            beforeSend: function () { }, // add loading image
            complete: function () { }, // delete loading image
            success: function (result) {
                if (isOn) swal("ON Success", result['result'], "success");
                else swal("OFF Success", result['result'], "success");
            },
            error: function (e) {
                console.log("ERROR : ", e);
                swal("Update Fail", `${site} 리스탁 링크 업데이트 에러: ${e['result']}`, "error");
            }
        });
    });
};

// delete (휴지통 아이콘 Action)
const deleteRestocksRequest = (siteInfo, deletLists) => {
    const data = {
        site: siteInfo,
        lists: deletLists
    };
    fetch('/restocks', {
        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then((response) => {
        const { status } = response;
        if (status === 404) return Promise.reject(new Error("Page url error!"));
        else if (status === 500) return Promise.reject(new Error("Internal server error!"));
        else if (status === 400) return Promise.reject(new Error("Bad request, check data!"));
        return response.json();
    }).then(function (data) {
        swal("Delete Success", data['result'], "success");
    }).catch((error) => { // 실패하면 여기온다
        console.warn(error);
        swal("Fail", String(error), "error");
    });
};

// get auto-restock number (start and range)
const getAutoRestock = (site) => {
    $.ajax({
        type: "GET",
        url: `/${site}/auto`,
        dataType: "json",
        success: function (json) {
            const list = $.parseJSON(json); // get result by Json type
            document.getElementById(`${site}-auto-content`).value = list['content'];
        },
        error: function (e) {
            console.log("ERROR : ", e);
            alert("fail: " + e['error']);
        }
    }); // ajax
}

// set auto-restock number (start and range)
const setAutoRestock = (site) => {
    const content = String(document.getElementById(`${site}-auto-content`).value).trim(); // 양 끝 공백 제거

    // 벨리데이션 체크
    if (content.indexOf(' ') >= 0) { // 공백 포함 체크 
        swal("Fail", `공백이 포함되어 있습니다!`, "error");
        return;
    }
    if (content.indexOf('-') < 0 || content.indexOf(',') < 0) {
        swal("Fail", `범위 지정 공식이 잘 못 되었습니다.`, "error");
        return;
    }
    if (content.split(',').length <= 1) {
        swal("Fail", `최소한 한개 이상의 범위(콤마 구분)가 있어야 합니다.`, "error");
        return;
    }

    // array 이상 이하 값 벨리데이션 체크 
    const arr_content = content.split(',');
    for (let i = 0; i < arr_content.length; i++) {
        const range_str = arr_content[i].split('-');
        if (Number(range_str[0]) > Number(range_str[1])) {
            swal("Fail", `${range_str[0]}이 ${range_str[1]} 보다 큰 값이 들어가면 안됩니다.`, "error");
            return;
        }
    }

    $.ajax({
        type: "POST",
        url: `/${site}/auto`,
        dataType: "json",
        data: { content: content },
        success: function (result) {
            swal("Success", `${result['message']} Update 성공!`, "success");
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Fail", `${e['error']}!`, "error");
        }
    }); // ajax    
};

// add sepcial event for restock / some doc (특히 Others -> Insta ) Event
const addRestockEvent = (site) => {

    // data check
    if (otherInstaAddTxt.value == null || otherInstaAddTxt.value == "" || otherInstaAddTxt.value == " ") {
        swal("Insert Fail", `${otherInstaAddTxt.value} 은 잘못된 데이터 입니다. 공백은 허용하지 않습니다.`, "error");
        return;
    }

    // json type data
    const data = {
        site: site,
        url: otherInstaAddTxt.value,
        hook_url: "https://discord.com/api/webhooks/818513885434740768/_OqlEAGuFs8KnHhuSMpYc4DMfyjJPZtHsDolqAMiQNFf4hCXWThazC1w4qiZwW7F9F26"
    };

    // request url setting
    const targetSite = site.toLowerCase();

    // fetching
    fetch(`${targetSite}/restock`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'include', // include, *same-origin, omit
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then((response) => {
        const { status } = response;
        if (status === 404) return Promise.reject(new Error("Page UID/URL value error! or Sign-in again plz"));
        else if (status === 500) return Promise.reject(new Error("Internal server error!"));
        else if (status === 400) return Promise.reject(new Error("Bad request, check data!"));
        return response.json();
    }).then(function (data) {
        if (data['result'] == 1) {
            swal("Success", `${otherInstaAddTxt.value} Add 성공!`, "success");

            // reloading value
            get_restock_link_list(site);
        }
        else swal("Fail", "DB Status Check, error!", "error");
    }).catch((error) => { // 실패하면 여기온다
        console.warn(error);
        swal("Fail", String(error), "error");
    });
}

// get Hook url
const getHookUrl = (site) => {
    $.ajax({
        type: "GET",
        url: `/hook/${site}`,
        dataType: "json",
        success: function (json) {
            const list = $.parseJSON(json); // get result by Json type
            document.getElementById(`${site}-hook-url`).value = list['url'];
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Fail", String(e['error']), "error");
        }
    }); // ajax
}

// set Hook url
const setHookUrl = (site) => {
    const url = document.getElementById(`${site}-hook-url`).value;

    // 공백 포함 체크 
    if (url.indexOf(' ') >= 0 || url == "" || url == " ") {
        swal("Fail", `공백이 포함되어 있습니다!`, "error");
        return;
    }

    // request 
    $.ajax({
        type: "PUT",
        url: `/hook`,
        dataType: "json",
        data: { site, url },
        success: function (result) {
            swal("Success", `${result['message']} Update 성공!`, "success");
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Fail", `${e['error']}!`, "error");
        }
    }); // ajax    
};

// get User info 
const getUserInfo = (site, next) => {
    $.ajax({
        type: "GET",
        url: `/user/${site}`,
        dataType: "json",
        success: function (json) {
            const list = $.parseJSON(json); // get result by Json type
            next(list); // next function -> call back function
        },
        error: function (e) {
            console.log("ERROR : ", e);
            swal("Fail", String(e['error']), "error");
        }
    }); // ajax
}

//-------------------------------------------------------------------------------------------//
/* Private Target Function [ 재사용성 보다는 특정 목적을 위한 함수 영역 ] */

// nike_wish페이지에서 유저 목록 랜더링 
function renderWishUsers(targetList) {

    // target DOM child check 
    if ($('#NikeWish .restock-list').find('*').length > 1) {
        const arr_remove = $('#NikeWish .restock-list').find('*');
        for (let index = 1; index < arr_remove.length; index++) {
            arr_remove[index].remove();
        }
    }

    // list rendering
    for (let index = 0; index < targetList.length; index++) {
        $('#NikeWish .restock-list').append(
            `<li class="list-group-item restock-item-list">
                ${targetList[index]['id']}
                <button type="button" class="restock-link btn btn-warning btn-sm hvr-grow" target-link="${targetList[index]['id']}">Delete</button>
            </li>
            `
        );
    }

    // add delete action to dynamic delete button 
    deleteWishUsers();
}

// nike_wish페이지에서 타겟 유저 삭제
function deleteWishUsers() {
    $(".restock-item-list").on("click", "button", function () {
        const id = $(this).attr('target-link');
        $.ajax({
            type: "DELETE",
            url: "/nike_wish/user",
            dataType: "json",
            data: { id },
            success: function (result) {
                swal("Delete Success", result['result'], "success");
            },
            error: function (e) {
                console.log("ERROR : ", e);
                swal("Delete Fail", `${attr} 링크를 제거 에러: ${e}`, "error");
            }
        }); // ajax
    });
}


//-------------------------------------------------------------------------------------------//
/* Main and Init area */

const initMain = () => {

    // add sidebarCollapse click event
    sidebarCollapse.addEventListener('click', () => {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("active");
    });

    // When the user scrolls down 20px from the top of the document, show the button
    window.onscroll = () => { scrollFunction(); };
    topButton.addEventListener('click', (event) => { toTopFunction(event.target, 250); });

    // nike upcoming set up
    getNikeUpcoming();
    enterKeyEvent(nikeUpcomingText, updateNikeUpcoming);
    nikeUpcomingBtn.addEventListener('click', updateNikeUpcoming);

    // New Restock (Group) List 체크박스 삭제 액션 추가 
    for (const target of restockCheckDelBtn) {
        target.addEventListener('click', function (event) {
            event.preventDefault(); // 원래 이벤트 발동 X
            const siteInfo = target.getAttribute('data-target');
            const parentTable = document.getElementById(siteInfo);
            const targetDatas = parentTable.querySelectorAll('.restock-list-checkbox');

            let deletLists = [];
            for (const list of targetDatas) {
                const obj = list.querySelector('input');
                if (obj.checked) deletLists.push(obj.getAttribute('id'));
            }

            if (deletLists.length <= 0) {
                swal("Fail", "체크 박스를 선택해주세요!", "error");
                return;
            }

            // main request ajax
            deleteRestocksRequest(siteInfo, deletLists);
        });
    }

    // Add Auto Restock Set Range Event
    const kasinaSetRange = document.getElementById("Kasina-set-range");
    const atmosSetRange = document.getElementById("Atmos-set-range");
    const hoopcitySetRange = document.getElementById("Hoopcity-set-range");
    kasinaSetRange.addEventListener('click', () => setAutoRestock("Kasina"));
    atmosSetRange.addEventListener('click', () => setAutoRestock("Atmos"));
    hoopcitySetRange.addEventListener('click', () => setAutoRestock("Hoopcity"));

    // Add Excluder Button Event
    excluderBtn.forEach(btn => btn.addEventListener('click', excluderEvent));

    // Add Other Insta Event
    otherInstaAddTxt.addEventListener('keyup', (event) => { if (event.key === 'Enter') addRestockEvent("Others"); });
    otherInstaAddBtn.addEventListener('click', () => addRestockEvent("Others"));
}

const initWish = () => {
    // Add sidebarCollapse click event
    sidebarCollapse.addEventListener('click', () => {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("active");
    });

    // When the user scrolls down 20px from the top of the document, show the button
    window.onscroll = () => { scrollFunction(); };
    topButton.addEventListener('click', (event) => { toTopFunction(event.target, 250); });

    // Add pid range GET and SET
    getAutoRestock("NikeWish");
    const nikeWishSetRange = document.getElementById("nike-wish-update");
    nikeWishSetRange.addEventListener('click', () => setAutoRestock("NikeWish"));

    // Add Hook url GET and SET
    getHookUrl("NikeWish");
    const nikeWishHookUpdate = document.getElementById("NikeWish-hook-update");
    nikeWishHookUpdate.addEventListener('click', () => setHookUrl("NikeWish"));
    document.getElementById("NikeWish-hook-url").addEventListener('keyup', (event) => {
        if (event.key === 'Enter') setHookUrl("NikeWish");
    });

    // Get User info about nike_wish
    getUserInfo("NikeWish", renderWishUsers);

    // Add Init action (DB, wish list length value init)
    document.getElementById("init-btn").addEventListener('click', (event) => {
        // ajax
        $.ajax({
            type: "POST",
            url: `/NikeWishListLength/auto`,
            dataType: "json",
            data: { content: 0 },
            success: function (result) {
                swal("Success", `${result['message']}`, "success");
            },
            error: function (e) {
                console.log("ERROR : ", e);
                swal("Fail", `${e['error']}!`, "error");
            }
        }); // ajax
    });
}
//-------------------------------------------------------------------------------------------//
/* Get Documents ready -> Start up every functions */

// document.addEventListener("DOMContentLoaded", function () {
//     init();
// });

const pathName = window.location.pathname;
if (pathName === "/main") initMain();
else if (pathName === "/nike_wish") initWish();