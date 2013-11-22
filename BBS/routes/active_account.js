/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-31
 * Time: 上午9:06
 * To change this template use File | Settings | File Templates.
 */
var User = require('../models/user_m');
var Active_Account = require('../models/active_account_m');

module.exports = function(app){

    app.get('/active_account',function(req,res){
        var keys = req.query.keys;
        var name = req.query.name;
        console.log(keys);
        console.log(name);
        var msg="";
        var error="";
        var account = new Active_Account({name:name,keys:keys});
        Active_Account.get(account,function(err,result){
            if(err ||result == null ){
                error="信息有误，帐号无法被激活。";
                req.flash('error',error);
                return res.redirect('/notice');
            }

            else{
                if(result.active == null ||result.active==0 ){
                    Active_Account.update_active(account,function(err){
                        if(err){
                            error="信息有误，帐号无法被激活。";
                            req.flash('error',error);

                            return res.redirect('/notice');
                        }
                        else{
                            User.update_active(name,function(err){
                                if(err){
                                    console.log(err);
                                    error="信息有误，帐号无法被激活。";
                                    req.flash('error',error);

                                }
                                else{
                                    msg ="该账号已经激活，请登录论坛。"
                                    req.flash('info',msg);
                                }
                                return res.redirect('/notice');
                            });
                        }
                    });
                }
                else{
                    msg="帐号已经是激活状态。";
                    console.log('帐号已经是激活状态')
                    req.flash('info',msg);
                    return res.redirect('/notice');
                }
            }

        });

    });
    app.get('/notice',function(req,res){

       // console.log(req.flash('info'));
        return res.render('notice',{title:"通知"});

    })


}