//弹出回复框
//针对一级回复

function comment_1(current) {
    var current_id = current.id;
    //alert(current_id);
    var parent = current.parentNode.parentNode.parentNode;
    var reply_node = parent.parentNode;
    // alert(parent.id);
    var name_node = parent.children[0].children[0].children[1].children[0].children[0] //被回复人的节点
   // alert(name_node.id);
    //alert(name_node.children.length);
   // alert(name_node.children[0]);
   var name_ = name_node.innerHTML;
    var parent_id = parent.id;
    // alert(parent.nextSibling.id);

    var brother_2 =$("#"+parent_id).next().next(); //获取clearfix节点
    var first_child = brother_2.children(":first");
    // alert(first_child);
    // alert(brother_2.attr("id"));
    //alert(first_child.attr("id"));

    var append_id = first_child.attr("id");
    //alert(append_id);
    var reply_id = reply_node.id;
   // alert(reply_id);
    var form_id = reply_id +'_form';
  // alert(form_id);
    if($("#"+form_id).length > 0){
       // alert('exits');
        return;
    }
    var topic_id = document.getElementById("topic_id").getAttribute("topic_id");
    var html = '<div id='+ form_id + '><form  method="post" action="/comment" style="padding-left: 20px">' +
        '<div>' +
        ' <input type="hidden" name="reply_id_" id="reply_id_" value=' + reply_id + '>' +
        ' <input type="hidden" name="topic_id_" id="topic_id_" value=' + topic_id + '>' +
        ' <input type="hidden" name="name_" id="name_" value=' + name_ + '>' +
        '<textarea class="span8" name="reply_text_"id="reply_text_"rows="8" style="width: 98%"/>' +
        '</div>' +
        '<div>' +
        '<button class="btn reply2_submit_btn" type="submit">回复</button>' +
        '</div>'
    '</form>'
    // alert(html);
    // $("#" + reply_id).append(html);
    //$("#parent").children().eq(0).prv(html);

    if($("#"+append_id).children().length){
        $("#"+append_id).children().eq(0).before(html);
    }
    else{
        $("#"+append_id).append(html);
    }
    //$("#12345678").append(html);
}
//二级回复
function comment_2(current){
    var reply_node = current.parentNode.parentNode.parentNode.parentNode;
    var comment_id =reply_node.id; //二级评论ID
   // var value = reply_node.attr("reply_id_");
   // alert(value);
    //alert(reply_node.id);
   // alert(reply_node.getAttribute("reply_id_"));
    var topic_id = document.getElementById("topic_id").getAttribute("topic_id");
    var reply_id = reply_node.parentNode.parentNode.parentNode.id;
    var form_id = comment_id +'_form';
   // alert(form_id);
    if($("#"+form_id).length > 0){
        // alert('exits');
        return;
    }
    //alert(reply_id);
    //jquery 方法获取被回复人的名字
    var name_node = $(current).parent().parent();
    var t = $(name_node).prev();
    var ch = t.children().first().children().first();
    var name_ = ch.text();
    var html = '<div id='+ form_id + '><form  method="post" id="reply_form_" action="/comment" style="padding-left: 20px">' +
        '<div >' +
        ' <input type="hidden" name="reply_id_" id="reply_id_" value=' + reply_id + '>' +
        ' <input type="hidden" name="topic_id_" id="topic_id_" value=' + topic_id + '>' +
        ' <input type="hidden" name="name_" id="name_" value=' + name_ + '>' +
        '<textarea class="span8" name="reply_text_"id="reply_text_"rows="8" style="width: 98%"/>' +
        '</div>' +
        '<div>' +
        '<button class="btn reply2_submit_btn" type="submit">回复</button>' +
        '</div>'
    '</form></div>'
    $("#"+reply_node.id).after(html);


}