/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-5-28
 * Time: 下午3:12
 * To change this template use File | Settings | File Templates.
 */

var Topic = require('../models/topic_m');
var uuid = require('../util/uuid');
var Reply = require('../models/reply_m');
var User = require('../models/user_m');
var set = require('../setting');
var nodemailer = require('nodemailer');
var smtpTransport = nodemailer.createTransport("SMTP",set.mail);
module.exports=function(app){

    app.get('/topic/create',function(req,res){
        res.render('create',{title:'发表'});

    });
    app.post('/topic/create',function(req,res){
        if(req.body.title.length<6 || req.body.title.length > 100){
            req.flash('error',"标题长度不能小于6或大于100");
           return res.redirect('/topic/create');
        }
        if(req.body.t_content ==""){
            req.flash('error',"内容不能为空");
            return res.redirect('/topic/create');
        }
        var date = new Date();
        var recordTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '
            + date.getHours()+':'+date.getMinutes();
        var uri = uuid.generatorUUID();
        var topic = new Topic({
            title:req.body.title
            ,name : req.session.user.name
            ,content: req.body.t_content
            ,createdate : recordTime
            ,uri:uri
            ,click_count:0
            ,reply_count:0
            ,reply_time:recordTime

        });
       // console.log(topic);
        topic.save(function(err,result){
            if(err){
                console.error(err);
                res.redirect('/post');
            }
            var points = req.session.user.points+5;
            var user = new User({
                name:req.session.user.name,
                points: points
            });
            user.update_points(function(err){
                if(err){

                }else{
                    req.session.user.points+=5;
                }
                res.redirect('/topic/show?id='+uri);
            });
        });
    });

    app.get('/topic/show',function(req,res){

        var topicID = req.query.id;
        if(topicID === "null" || topicID == null){
           return  res.redirect('/');
        }

        Topic.getTopicDetail(topicID,function(err,result){
          //  console.log(result);
            if(err || result==null){
               // res.redirect('/');
                req.flash('error','该帖子不存在。')
                return res.redirect('/notice');
             //   result=[];
               // console.log(err);

            }
            else{
                var picture_name ="default.jpg";
                User.get(result.name,function(err,info){
                    if(err){
                            console.error(err);
                    }
                    else{
                        picture_name = info.picture_name;
                    }
                    Reply.getReplyByUri(topicID,function(err,replys){
                        if(err){
                            console.error(err);
                            replys=[];
                        }
                        //更新点击数
                        var click_count = result.click_count +1;
                        Topic.update_info(result.uri,click_count,null,null,function(err){

                            res.render('topicshow',{
                                title:result.title
                                ,content:result.content
                                ,createdate:result.createdate
                                ,uri:result.uri
                                ,createname:result.name
                                ,replys:replys
                                ,points:info.points

                            });
                        });


                    });

                });

            }

        });

    });
    app.get('/topic/index',function(req,res){

        var page = req.query.page;
        page = parseInt(page);
        var page_size =2;
        Topic.getTopicCount(function(err,counts){
         if(err){
            counts = 0;
         }
            //console.log(counts);
            Topic.getTopicByPage(page,page_size,function(err,topics){

                if(err){
                    topics=[];
                }

                var max_page_=0;
                if(topics.length < page_size){
                  //  page_size = topics.length;
                }

                if(counts % page_size){
                    max_page_ = parseInt(counts /page_size) +1;
                }
                else{
                    max_page_ =counts /page_size;
                }
               // console.log("max="+max_page_);

                res.render('index',{
                    title:'主页',
                    posts:topics,
                    page:page,
                    pagesize:topics.length,
                    max_page:max_page_
                    //createname:req.session.user.name
                });
            });
        });
    });

    app.post('/topic/reply',function(req,res){

        var uri = req.query.uri;
        if(req.body.r_content ==""){
            req.flash("error","回复内容不能为空。");
            return res.redirect('/notice');
        }
        var uri = req.query.uri;
        var title = req.body.title;
        var create_name = req.body.create_name;



        var date = new Date();
        var reply_time = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '
            + date.getHours()+':'+date.getMinutes();
        var reply = new Reply({
            uri:uri
            ,relpy_content:req.body.r_content  //回复人名字
            ,reply_name:req.session.user.name
            ,reply_time:reply_time
            ,comment: new Array()
            //,reply_picture_name:req.session.user.picture_name
        });
        //console.log(reply);
        reply.save(reply,function(err){
            if(err){
                console.error(err);
                res.redirect('/topic/show?id='+uri);
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

                    User.get(create_name,function(err,use){
                        if(err || use == null){
                            console.error(err);
                            use = [];
                        }else{
                            if(use.receive_at_mail!= null&&use.receive_at_mail ==1){
                                var link = "http://"+set.host+":"+set.port+"/topic/show?id=" +uri;
                                set.mailOptions.subject="话题评论";
                                set.mailOptions.to=use.email;
                                set.mailOptions.html = "<p> 您好:</p>  <br>" +
                                    "<p>"+req.session.user.name+"在话题</p>" +
                                    "<a href="+link +">" +title+ "</a>中回复了你<br> "+
                                    "<blockquote><p>"+req.body.r_content+"</p></blockquote><br>"+
                                    "<p>若您没有在"+set.name+"填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>";
                                //console.log(  set.mailOptions.html);
                                smtpTransport.sendMail(set.mailOptions, function (error, response) {
                                    if (error) {
                                        console.error(error);
                                    }});

                            }
                        }

                    })

                    //增加评论数,修改最新评论时间
                    Topic.getTopicDetail(uri,function(err,topic){
                        if(err){
                            console.error(err);
                            res.redirect('/topic/show?id='+uri);
                        }
                        else{
                            var reply_count = topic.reply_count+1;
                            Topic.update_info(uri,null,reply_count,reply_time,function(err){
                                if(err){
                                    console.log(err);
                                }
                                res.redirect('/topic/show?id='+uri);
                                //发送邮件，通知用户被回复


                            });
                        }
                    });
                });




                //update_points


            }
        })

    });


}