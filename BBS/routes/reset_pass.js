/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-31
 * Time: 上午11:54
 * To change this template use File | Settings | File Templates.
 */

var Reset_Pass = require('../models/reset_pass_m');
var User = require('../models/user_m');
var crypto = require('crypto');

module.exports=function(app){
    app.get('/reset_pass',function(req,res){
        var name = req.query.name;
        var keys = req.query.keys;
        var currentDate = new Date();
        var times = currentDate.getTime();
        Reset_Pass.get(name,function(err,reset){
            if(err || reset ==null){
                req.flash('error',"信息有误，无法修改密码");
                return res.redirect('/notice');
            }
            else{
                console.log(times);
                var recordtime = reset.timeout;
                console.log(times - recordtime);
                if(times - recordtime > 86400000){
                    req.flash('error',"重置时间到期，请重新重置");
                    return res.redirect('/notice');
                }
                else{
                    req.session.keys =keys;
                    req.session.name=name;

                    return res.render('reset_pass',{title:'密码重置'});
                }
            }
        });

    });
    app.get('/show_reset_pass',function(req,res){
        return res.render('reset_pass',{title:'密码重置'});
    })
    app.post('/reset_pass',function(req,res){
        req.session.user = null;
        var url = '/reset_pass?keys='+req.session.keys +'&name='+req.session.name;
        if (req.body.password == "") {
            req.flash('error', "密码不能为空");
            console.log('')
            return res.redirect(url);
        }
        delete req.session.error;
        //console.log(req.body['password-repeat']);
       // console.log(req.body['password']);
        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '两次输入的口令不一致');
            return res.redirect(url);
        }
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var user = new User({
            name:req.session.name,
            password:password
        });
        user.update_password(function(err){
            if(err){
                req.flash('error', '重置密码失败，请重试。');
                return res.redirect(url);
            }
            else{

                //删除数据库信息
                Reset_Pass.delete(req.session.name,function(err){
                    if(err){
                        req.flash('error', '重置密码失败，请重试。');
                        return res.redirect(url);
                    }
                    else{
                        req.flash('info', '重置密码成功。');
                        req.session.kyes =null;
                        req.session.name =null;
                        return res.redirect('/notice');
                    }
                })

            }

        })


    })
}