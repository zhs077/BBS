/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-5-23
 * Time: 上午11:42
 * To change this template use File | Settings | File Templates.
 */

var pool = require('./db_m');
//var bson = require('bson');
var mongodb = require('mongodb');

function Topic(topic){
    this.title = topic.title;
    this.name = topic.name;
    this.content = topic.content;
    this.createdate = topic.createdate;
    this.uri = topic.uri;
    this.click_count = topic.click_count;
    this.reply_count = topic.reply_count;
    this.reply_time = topic.reply_time;
   // this.picture_name = info.picture_name;

}
module.exports = Topic;

Topic.prototype.save = function(callback){

    var topic={
        title:this.title,
        name:this.name,
        content:this.content,
        createdate:this.createdate,
        uri:this.uri,
        click_count:this.click_count,
        reply_count: this.reply_count,
        reply_time:this.reply_time

    }
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('topics').save(topic,function(err,result){
            pool.release(db);
            callback(err,result);

        });

    });
}

//关联用户表
//Topic.prototype.save=function(callback){
//
//    var topic={
//        title:this.title,
//        name:this.name,
//        content:this.content,
//        createdate:this.createdate,
//        uri:this.uri
//    }
//    pool.acquire(function(err,db){
//        if(err){
//            return callback(err);
//        }
//        db.collection('user').findOne({name:'admin'},function(err,users){
//            if(err){
//                return callback(err);
//            }
//            topic.user = [new mongodb.DBRef('user',users.picture_name)];
//
//
//            db.collection('topics').insert(topic,function(err){
//                pool.release(db)
//               callback(err);
//            })
//        });
//    });
//
//
////    pool.acquire(function(err,db){
////        if(err){
////            return callback(err);
////        }
////
////        db.collection('zzzz').find({title:'zzzzz'}).toArray(function(err,result){
////            //pool.release(db);
////          //  console.log(result);
////            //mongodb.DBRef
////            console.log(result[0].user[0].oid);
////            callback(err,result);
////
////        });
////
////    });
//
//}



//Topic.get = function(username,callback){
//
//    pool.acquire(function(err,db){
//
//        if(err){
//            return callback(err);
//        }
//        db.collection('post').find({name:username},function(err,result){
//            pool.release(db);
//            return callback(err,result);
//
//        });
//
//    });
//}

Topic.get = function(username,callback){

        pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection('topics').find({name:username}).toArray(function(err,topics){
            pool.release(db);
          //  console.log(result);
            //mongodb.DBRef
          //  console.log(result[0].user[0].oid);
            callback(err,topics);

        });

    });
}

Topic.getbyuri = function(uri,callback){

    pool.acquire(function(err,db){

        if(err){
            return callback(err);
        }
        db.collection('topics').find({uri:uri},function(err,result){
            pool.release(db);
            return callback(err,result);

        });

    });
}
//获取所有的数据
Topic.getAllTopics=function(title,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        if(title == null){
            db.collection('topics').find().sort({reply_time:-1}).toArray(function(err,docs){
                pool.release(db);
                callback(err,docs);

            });
        }else{
           // var a="{ $regex: '\a.*', $options: 'i' }";
            var pattern = new RegExp(title,"i");//不区分大小写
            db.collection('topics').find({'title':pattern}).sort({reply_time:-1}).toArray(function(err,docs){
                pool.release(db);
                callback(err,docs);
            });
        }

    });

}
//按页和每页多少查询
Topic.getTopicByPage=function(page,page_size,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('topics').find().skip((page-1)*page_size).limit(page_size).sort({reply_time:-1}).toArray(function(err,docs){

            pool.release(db);
            callback(err,docs);
        });
    });
}
//获取总个数
Topic.getTopicCount = function(callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('topics').count(function(err,count){

            pool.release(db);
            callback(err,count);
        });

});
};
//通过文章的ID获取文章内容
Topic.getTopicDetail=function(uid,callback){
    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('topics').findOne({uri:uid},function(err,result){

            pool.release(db);
            callback(err,result);
        });

    });
}

//获取某个用户创建的最多5篇文章
Topic.get_limit = function(username,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }

        db.collection('topics').find({name:username}).limit(5).toArray(function(err,topics){
            pool.release(db);
            callback(err,topics);

        });

    });
}

//更新点击数，评论数，最新评论时间
Topic.update_info=function(uri,click_count,reply_count,reply_time,callback){

    pool.acquire(function(err,db){
        if(err){
            return callback(err);
        }

        if(click_count !=null){
            db.collection('topics').update({uri:uri},{$set:{click_count:click_count}},function(err){
                pool.release(db);
                callback(err);

            });
        }
        if(reply_count !=null &&reply_time !=null ){
            db.collection('topics').update({uri:uri},{$set:{reply_count:reply_count,reply_time:reply_time}},function(err){
                pool.release(db);
                callback(err);

            });
        }

    });

}
