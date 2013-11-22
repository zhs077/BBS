/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-11-6
 * Time: 下午5:02
 * To change this template use File | Settings | File Templates.
 */

var Comment = require('../models/comment_m');
var UUID = require('../util/uuid');
var User = require('../models/User_m');
var Topic = require('../models/Topic_m');
module.exports=function(app){
    app.post('/comment',function(req,res){

        var reply_id = req.body.reply_id_;
        var topic_id = req.body.topic_id_;
        var content = req.body.reply_text_;
        console.log(content);
        if(content ==""){
            req.flash("error","回复内容不能为空。");
            return res.redirect('/notice');
        }
        var reply_name = req.session.user.name;
        var name = req.body.name_;
        var date = new Date();
        var reply_time = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '
            + date.getHours()+':'+date.getMinutes();
        var comment = new Comment({
        reply_name:reply_name
        ,name:name
        ,content:content
        ,reply_time:reply_time
        ,reply_id_:UUID.generatorUUID()
        });
        Comment.update(topic_id,reply_id,comment,function(err){
            if(err){
                console.error(err);
                return  res.redirect('/topic/show?id='+ topic_id);
            }
            else{
                var user = new User({
                    name:req.session.user.name,
                    points : req.session.user.points + 2
                });
                user.update_points(function(err){
                    if(err){

                    }else{
                        req.session.user.points+=2;
                    }

                    //增加评论数,修改最新评论时间
                    Topic.getTopicDetail(topic_id,function(err,topic){
                        if(err){
                            console.error(err);
                            res.redirect('/topic/show?id='+ topic_id);
                        }
                        else{
                            var reply_count = topic.reply_count+1;
                            Topic.update_info(topic_id,null,reply_count,reply_time,function(err){
                                if(err){
                                    console.error(err);
                                }
                                res.redirect('/topic/show?id='+ topic_id);
                            });
                        }
                    });
                });

            }
        });

    });

}