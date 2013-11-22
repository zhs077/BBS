/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-23
 * Time: 下午3:30
 * To change this template use File | Settings | File Templates.
 */
var pool = require('./db_m');
//回复的构造函数
function Reply(relpy){
    this.uri = relpy.uri;
    this.reply_time =relpy.reply_time;
    this.relpy_content = relpy.relpy_content;
    this.reply_name = relpy.reply_name;
    this.comment = relpy.comment;
    //this.reply_picture_name = relpy.reply_picture_name;
}
module.exports = Reply;
//保存回复信息
Reply.prototype.save=function(relpy,callback){

   // console.log(typeof (relpy.comment)+'fffffffffffffffffffff');
    pool.acquire(function(err,db){
        if (err) {
            return callback(err);
        }
        db.collection('replys').save(relpy,function(err,result){
            pool.release(db);
            callback(err,result);
        });

    });
}
//获取和uri相应的所有回复
Reply.getReplyByUri=function(uri,callback){

    pool.acquire(function(err,db){
       if(err){
           return callback(err);
       }
        db.collection("replys").find({uri:uri}).sort({reply_time:-1}).toArray(function(err,replys){
            pool.release(db);
            callback(err,replys);

        });


    });
}

