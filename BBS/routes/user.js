var fs = require('fs');
var User = require('../models/user_m');
var Active_Account = require('../models/active_account_m');
var Topic = require('../models/topic_m');
var Reset_Pass = require('../models/reset_pass_m');
var nodemailer = require('nodemailer');
var UUID = require('../util/uuid');
var set = require('../setting');
var crypto = require('crypto');


module.exports = function (app) {
    app.get('/user/set', function (req, res) {

        if(req.session.user == null){
            req.flash("error","超时，请重新登录。");
            return res.redirect('/notice');
        }

        //console.log('set');
        res.render('setting',
            {title: '用户设置'
                //name:req.session.user.name,
                //address:req.session.address,
                //  sign:req.session.sign,
                // picture:req.session.picture
            });
    });

    app.post('/user/setting', function (req, res) {
        //console.log('setting');
       console.log(req.body.receive_at_mail);
        var receive_at_mail= 0;
        if(req.body.receive_at_mail =="on"){
            receive_at_mail =1
        }
        var user = new User({
            name: req.session.user.name,
            address: req.body.address,
            sign: req.body.sign,
            receive_at_mail:receive_at_mail

        });
        user.update_info(function (err) {
            if (err) {
                req.flash('error', '更新失败:' + err);
            } else {
                req.flash('info', '更新成功');
                req.session.user.address = user.address;
                req.session.user.sign = user.sign;
                req.session.user.receive_at_mail = receive_at_mail;


            }

            res.redirect('/user/set');
        });

    });

    app.post('/user/pic-upload', function (req, res) {

        // console.log(req);
        var tmp_path = req.files.pic.path;
        var file_name = req.files.pic.name;
        //  console.log("filename"+file_name);
        // console.log(typeof (file_name));
        if (file_name == "") {
            req.flash('error', '请选择图片');
            return  res.redirect('/user/set');
        }
        var name_array = file_name.split('.');
        var extension_name = name_array[name_array.length - 1];
        if(extension_name.toLowerCase() !="png"){
            req.flash("error",'请选择png图片');
            return  res.redirect('/user/set');

        }
        var target_path = './public/images/logo/'
        var target_file = target_path + req.session.user.name + '.' + extension_name;

        fs.exists(target_path, function (exit) {
            if (!exit) {
                fs.mkdirSync(target_path, 0755);
            }
            fs.exists(target_file, function (exit) {
                fs.rename(tmp_path, target_file, function (err) {
                    if (err) {
                        console.log(err);
                        req.flash('error', '更新头像失败:' + err);
                        res.redirect('/user/set');

                    }
                    var user = new User({
                        name: req.session.user.name,
                        address: req.session.user.address,
                        sign: req.session.user.sign,
                        picture_name: req.session.user.name + '.' + extension_name

                    });
                    user.update_info(function (err) {
                        if (err) {
                            req.flash('error', '更新头像失败:' + err);
                        } else {
                            req.flash('info', '更新头像成功');
                            req.session.user.picture_name = user.picture_name;
                        }
                        res.redirect('/user/set');
                    });

                    //express3.x的版本 不需要再unlink
//                       fs.unlink(tmp_path,function(err){
//                           if(err){
//                               console.log(err);
//                           }
//                         //  res.render('setting',{title:'用户设置',name:req.session.user.name});
//                           res.redirect('/user/set');
//                       });
                });
//                   fs.rename(tmp_path,target_file,function(err){
//                       if(err){
//                           console.log(err);
//                       }
//
//                   });
//                   var writeStream = fs.createWriteStream(target_file,{flags:'w',encoding:'binary',mode:0666});
//
//                   var readStream = fs.createReadStream(tmp_path,{flags:'r',encoding:"binary",mode : 0666});
//                   readStream.on('data',function(data){
//                      // console.log(data);
//                       writeStream.write(data)
//                   });
//                   readStream.on('end',function(){
//                       console.log('eee');
//                       writeStream.end();
//                       fs.unlinkSync(target_file);
//
//                       fs.rename(tmp_path,target_file,function(err){
//                           if(err){
//                               console.log(err);
//
//                           }
//                           fs.unlink(tmp_path,function(err){
//                               if(err){
//                                   console.log(err);
//                               }
//                               res.render('setting',{title:'用户设置',name:req.session.user.name});
//                           });
//                       });
//                   });
//                   readStream.on('error',function(err){
//                       console.log(err);
//                   });

            });
        });
    });
    app.get('/user/search_pass', function (req, res) {
       res.render('search_pass', {title: '密码找回'});
    });

    app.post('/user/search_pass', function (req, res) {
        var email = req.body.email;
        User.get_email(email, function (err, user) {
            if (user == null) {
                req.flash('error', "该邮箱不存在");
                return res.redirect('/user/search_pass');
            }
            var smtpTransport = nodemailer.createTransport("SMTP", set.mail);
            set.mailOptions.subject = "密码重置";
            set.mailOptions.to=email;
            var keys = UUID.generatorUUID();
            var  link="http://"+set.host+":"+set.port+"/reset_pass?keys=" +keys +"&name=" + user.name;
            set.mailOptions.html = "<ap> 您好:</p>  <br>" +
                "<p>我们收到您"+ set.name+"重置密码的请求，请在24小时内单击下面的链接来重置密码</p>" +
                "<br><a href=" + link + ">重置密码链接</a> <br>" +
                "<p>若您没有在"+set.name+"填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>"
            smtpTransport.sendMail(set.mailOptions, function (err, response) {
                if(err){
                    console.error(err);
                    req.flash('error', '邮件发送失败:'+ err);
                    smtpTransport.close();
                    return res.redirect('/user/search_pass');

                }else{
                    // 删除原先的

                   Reset_Pass.delete(user.name,function(err){
                        if(err){
                            console.error(err);
                       }
                        var currentDate = new Date();
                        var reset_pass = new Reset_Pass({
                            name:user.name,
                            keys:keys,
                            timeout: currentDate.getTime()
                        });
                        reset_pass.save(function(err){
                            if(err){
                                console.error(err);
                                req.flash('error',"发送邮件失败请重新发送");
                                return res.redirect('/notice')
                            }
                            req.flash('info',"重置密码链接已发送到您的邮箱。");
                            return res.redirect('/notice')
                        });
                    });
                }
            });
        });
    });

    app.get('/user/*',function(req,res){
       // console.log(req.path);
        var username = req.path.substring(req.path.lastIndexOf ('/')+1);
        User.get(username,function(err,user){
           if(err){
               console.error(err);
           }
            Topic.get_limit(username,function(err,topics){
                if(err){
                    console.error(err);
                    topics=[];
                }
                console.log(topics);
                res.render('user_info',{title:'用户信息',user:user,topics:topics});
            })
        });
       // console.log(username);
       // res.render('user_info',{title:'用户信息',name:username});
    });
    app.post('/user/pass_update',function(req,res){

        var old_pass = req.body.old_pass;
        var new_pass = req.body.new_pass;
        console.log(old_pass);
        console.log(new_pass);
        if(old_pass=="" ||new_pass=="" ){
            req.flash('error',"密码不能为空。");
            return res.redirect('/user/set');
        }
        var md5 = crypto.createHash('md5');
        var old_password = md5.update(old_pass).digest('base64');
       User.get(req.session.user.name,function(err,result){
           if(err ){
               console.log(err);
           }
           if(old_password != result.password){
               req.flash('error',"原始密码错误。");
               return res.redirect('/user/set');
           }
           var md5_2 = crypto.createHash('md5');
           var new_password = md5_2.update(new_pass).digest('base64');
           var user = new User({
               name:req.session.user.name,
               password:new_password
           });
           user.update_password(function(err){
               if(err){
                   req.flash('error',"更新密码失败。");
                   return res.redirect('/user/set');
               }
               else{
                   req.flash('info',"更新密码成功,请重新登录。");
                   delete req.session.user;
                   res.redirect('/login');
               }

           })

       });



    })
}