paging_2 = (total, dataPerPage, pageCount, currentPage) => {
    var cell = document.getElementById('buy-table-list');
    console.log(cell)
    while (cell.hasChildNodes()) {
        cell.removeChild(cell.firstChild);
    }
    var cnt = 0;
    var List_Of_Buying;
    var totalData = total.length;
    var totalPage = Math.ceil(totalData / dataPerPage);    // 총 페이지 수
    var pageGroup = Math.ceil(currentPage / pageCount);    // 페이지 그룹

    var last = totalPage >= 5 ? pageGroup * pageCount : totalPage;    // 화면에 보여질 마지막 페이지 번호
    if (last > totalPage) last = totalPage;
    // var first = last - (pageCount - 1);    // 화면에 보여질 첫번째 페이지 번호
    var first = last - (pageCount - 1) <= 0 ? 1 : last - (pageCount - 1);
    var next = last + 1;
    var prev = first - 1;
    var $pingingView = $("#paging_2");

    var html = "";

    if (prev > 0)
        html += "<a href=# id='prev_2'> < </a>";

    for (var i = first; i <= last; i++) {
        html += "<a href='#' id=" + "b_" + i + "> " + i + " </a> ";
    }
    var num = parseInt(totalData / 10);
    var sur = totalData % 10;
    var lst = currentPage * 10;
    if (num + 1 == currentPage) {
        var lst = (currentPage - 1) * 10 + sur;
    }
    for (var i = (currentPage - 1) * 10; i < lst; i++) {
        cnt++;
        List_Of_Buying = document.all('buy-table-list').insertRow();

        var objCell_Num = List_Of_Buying.insertCell();
        objCell_Num.innerHTML = cnt;

        var objCell_Date = List_Of_Buying.insertCell();
        objCell_Date.innerHTML = total[i].date;

        var objCell_Name = List_Of_Buying.insertCell();
        objCell_Name.innerHTML = total[i].name;

        var objCell_Phone = List_Of_Buying.insertCell();
        objCell_Phone.innerHTML = total[i].phone;

        var objCell_Address = List_Of_Buying.insertCell();
        objCell_Address.innerHTML = total[i].wallet;

        var objCell_STC = List_Of_Buying.insertCell();
        objCell_STC.innerHTML = total[i].stc;
    }

    if (last < totalPage)
        html += "<a href=# id='next_2'> > </a>";

    $("#paging_2").html(html);    // 페이지 목록 생성
    $("#paging_2 a").css("color", "black");
    $("#paging_2 a#b_" + parseInt(currentPage)).css({
        "text-decoration": "none",
        "color": "red",
        "font-weight": "bold"
    });    // 현재 페이지 표시

    $("#paging_2 a").click(function () {

        var $item = $(this);
        var $id = $item.attr("id");
        var selectedPage = $item.text();

        if ($id == "next_2") selectedPage = next;
        if ($id == "prev_2") selectedPage = prev;

        paging_2(total, dataPerPage, pageCount, selectedPage);
    });
}