/**
 *
 */
var pool = require('./db_m')
,mongodb = require('mongodb')
function Comment(comment){

    this.reply_name = comment.reply_name;//回复人
    this.name  = comment.name;//被回复人
    this.content = comment.content;
    this.reply_time= comment.reply_time;
    this.reply_id_ = comment.reply_id_;


}

module.exports=Comment;
Comment.update=function(uri,_id,comment,callback){
   // console.log('update');
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('replys').update({uri:uri,_id: mongodb.ObjectID(_id)},{$push:{comment:comment}},{safe: true},function(err,result){
            pool.release(db);
            callback(err,result);
        });
    })
}


