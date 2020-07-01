paging_1 = (total, dataPerPage, pageCount, currentPage) => {
    console.log('currentPage', currentPage)
    var cell = document.getElementById('sell-table-list');
    console.log(cell)
    while (cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
    }
    var cnt = 0;
    var List_Of_Selling;
    var totalData = total.length;
    var totalPage = Math.ceil(totalData / dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage / pageCount);    // 페이지 그룹

    var last = totalPage >= 5 ? pageGroup * pageCount : totalPage;    // 화면에 보여질 마지막 페이지 번호
    if (last > totalPage) last = totalPage;
    var first = last - (pageCount - 1) <= 0 ? 1 : last - (pageCount - 1); // 화면에 보여질 첫번째 페이지 번호
    var next = last + 1;
    var prev = first - 1;
    var $pingingView = $("#paging_1");

    var html = "";

    if (prev > 0)
        html += "<a href=# id='prev_1'> < </a>";

    for (var i = first; i <= last; i++) {
        html += "<a href='#' id=a_" + i + "> " + i + " </a> ";
    }
    var num = parseInt(totalData / 10);
    var sur = totalData % 10;
    var lst = currentPage * 10;
    if (num + 1 == currentPage) {
        var lst = (currentPage - 1) * 10 + sur;
    }
    for (var i = (currentPage - 1) * 10; i < lst; i++) {
        cnt++;
        List_Of_Selling = document.all('sell-table-list').insertRow();

        var objCell_Num = List_Of_Selling.insertCell();
        objCell_Num.innerHTML = cnt;

        var objCell_Date = List_Of_Selling.insertCell();
        objCell_Date.innerHTML = total[i].date;

        var objCell_Name = List_Of_Selling.insertCell();
        objCell_Name.innerHTML = total[i].name;

        var objCell_Phone = List_Of_Selling.insertCell();
        objCell_Phone.innerHTML = total[i].phone;

        var objCell_Address = List_Of_Selling.insertCell();
        objCell_Address.innerHTML = total[i].wallet;

        var objCell_STC = List_Of_Selling.insertCell();
        objCell_STC.innerHTML = total[i].stc;
    }

    if (last < totalPage)
        html += "<a href=# id='next_1'> > </a>";

    $("#paging_1").html(html);    // 페이지 목록 생성
    $("#paging_1 a").css("color", "black");
    $("#paging_1 a#a_" + parseInt(currentPage)).css({
        "text-decoration": "none",
        "color": "red",
        "font-weight": "bold"
    });    // 현재 페이지 표시

    var st = (currentPage - 1) * 10;
    if (currentPage * 10 > totalData) {
    }

    $("#paging_1 a").click(function () {

        var $item = $(this);
        console.log($item)

        var $id = $item.attr("id");
        console.log($id)
        var selectedPage = $item.text();
        console.log(selectedPage)

        if ($id == "next_1") selectedPage = next;
        if ($id == "prev_1") selectedPage = prev;

        paging_1(total, dataPerPage, pageCount, selectedPage);
    });
}