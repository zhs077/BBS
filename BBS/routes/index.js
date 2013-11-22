/*
 * GET home page.
 */

var User = require('../models/user_m');
var Topic = require('../models/topic_m');
var Active_Account = require('../models/active_account_m');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var UUID = require('../util/uuid');
var set = require('../setting');
var fs = require('fs');
var smtpTransport = nodemailer.createTransport("SMTP",set.mail);

module.exports = function (app) {
    app.get('/', function (req, res) {
        var max_page_ = 0;
        var page = req.query.page;
       // console.log(req.cookies);
        if (!page) {
            page = 1;
        }
        else {
            page = parseInt(page);
        }
        // page = 4;
        Topic.getAllTopics(req.query.q,function (err, topics) {

            if (err) {
                topics = [];
            }
            var pagesize_ = set.pagesize_;
            if (topics.length < pagesize_) {
                pagesize_ = topics.length;
            }

            if (topics.length % pagesize_) {
                max_page_ = parseInt(topics.length / pagesize_) + 1;
            }
            else {
                max_page_ = topics.length / pagesize_;
            }
           // console.log(max_page_);
            //console.log(     page)
           // console.log(topics);

            res.render('index', {
                title: set.name,
                posts: topics,
                page: page,
                pagesize: pagesize_,
                max_page: max_page_

            });
        })
    });
    app.get('/reg', function (req, res) {
        if (req.session.reg_statu == 1) {
            req.session.reg_statu = null;
        }
        res.render('reg', {title: '注册'});

    });
    app.post('/reg', function (req, res) {

        if (req.body.username == "" ||
            req.body.password == "" ||
            req.body.email == "") {
            req.flash('error', "输入的格式不能为空");
            return res.redirect('/reg');
        }
        delete req.session.error;
        //console.log(req.body['password-repeat']);
       // console.log(req.body['password']);
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的口令不一致');
            return res.redirect('/reg');
        }
        else {
//            此帐号还没有被激活，激活链接已发送到 436062598@qq.com 邮箱，请查收。
            //检查用户是否存在
            User.get(req.body.username, function (error, user) {
                if (user) {
                    error = '用户名或邮箱已被使用。';
                }
                if (error) {
                    req.flash('error', error);
                    return res.redirect('/reg');
                }
                else {
                    User.get_email(req.body.email, function (err, result) {
                        if (result != null) {
                            req.flash('error', '用户名或邮箱已被使用。');
                            return res.redirect('/reg');
                        }
                        var keys = UUID.generatorUUID();
                        var link = "http://"+set.host+":"+set.port+"/active_account?keys=" + keys + "&name=" + req.body.username;
                        //console.log(link);
                       // console.log(set.mailOptions);
                        set.mailOptions.subject="账号激活";
                        set.mailOptions.to=req.body.email;
                        set.mailOptions.html = "<a> 您好:</a>  <br>" +
                            "<p>我们收到您在" +set.name+"的注册信息，请点击下面的链接来激活帐户</p>" +
                            "<br><a href=" + link + ">激活链接</a> <br>" +
                            "<p>若您没有在"+set.name+"填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>"
                        smtpTransport.sendMail(set.mailOptions, function (error, response) {
                            if (error) {
                                console.log(error);
                                req.flash('error', '邮件发送失败,请检查邮箱是否有效。');
                                smtpTransport.close();
                                return res.redirect('/reg');

                            } else {
                                console.log("Message sent: " + response.message);
                                var md5 = crypto.createHash('md5');
                                var password = md5.update(req.body.password).digest('base64');
                                var date = new Date();
                                var join_time = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '
                                    + date.getHours()+':'+date.getMinutes();
                                var newUser = new User({
                                    name: req.body.username,
                                    password: password,
                                    email: req.body.email,
                                    join_time:join_time,
                                    points:0,
                                    active:0,
                                    picture_name:'default.jpg',
                                    receive_at_mail:1,
                                    sign:"",
                                    address:""
                                });

                                newUser.save(function (err, user) {
                                    if (err) {
                                        req.flash('error', '注册失败:' + err);
                                        // console.log('注册失败：'+err);
                                        return res.redirect('/reg');
                                    }
                                    var account = new Active_Account({
                                        name: req.body.username,
                                        keys: keys
                                    });
                                    //console.log(account);
                                    account.save(function(err) {
                                        if (err) {
                                            console.error(err);
                                        }
                                        else {
                                            console.log('保存成功');
                                            req.session.reg_statu = 1;
                                            req.flash('info', '欢迎加入'+set.name +'！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。');
                                            //给用户创建一个默认的图片
                                            var target_path = './public/images/logo/';
                                            var tmp_path =  './public/images/default.png';
                                            var target_file = target_path + req.body.username + '.png' ;

                                            try{

                                                var readStream = fs.createReadStream(tmp_path,{flags:'r',encoding:'binary'});
                                                // var writeStream = fs.createWriteStream(target_file,{flags:"w",encoding:"binary"});
                                                var buffer=new Buffer(0);
                                                readStream.on('data',function(data){
                                                    buffer+=data;
                                                });
                                                readStream.on('end',function(data){
                                                    fs.writeFile(target_file,buffer,{encoding:"binary"},function(err){
                                                        if(err){
                                                            console.log(err);
                                                        }
                                                    });
                                                    readStream.close();

                                                    return res.redirect('/reg');
                                                });

                                            }
                                            catch (e){
                                                console.error(e);
                                            }

                                        }


                                    });
                                });
                            }
                            smtpTransport.close();
                        });
                    });
                }

            });
        }

    });

    app.get('/login', function (req, res) {
        res.render('login', {title: '登录'});

    });
    app.post('/login', function (req, res) {

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        User.get(req.body.username, function (err, user) {

            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '密码错误');
                return res.redirect('/login');
            }
            if(user.active == null || user.active != 1){
                req.flash('error', '该账号未激活,请查看邮件激活。');
                return res.redirect('/login');
            }
            req.session.user = user;

            if (req.session.user.picture_name == null) {
                req.session.user.picture_name = "default.jpg";
            }
            return   res.redirect('/');
        });
    });
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.session.reg_statu = null;
        res.redirect('/');
    });

    app.get('/download',function(req,res){
        var id = req.query.id;
        var file;
        if(id == 1){ //谷歌
            file ="./public/files/Chrome.exe"
        }else if(id == 2){ //火狐
            file ="./public/files/Firefox.exe"
        }else if(id == 3){//IE10
            file ="./public/files/IE.exe"

        }
        res.download(file);
//        fs.exists(file,function(exits){
//            if(exits){
//                var readStream = fs.createReadStream(file,{flags:'r',encoding:'binary'});
//                res.writeHead(200,{"Content-Type":"application/x-msdownload"});
//                readStream.pipe(res);
//                readStream.on("end", function() {
//                    res.end();
//                });
//            }
//        });

    });


}