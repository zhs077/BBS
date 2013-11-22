/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-24
 * Time: 下午4:38
 * To change this template use File | Settings | File Templates.
 */
var settings = require('../setting')
    ,mongodb = require('mongodb')
    ,poolModule = require('generic-pool')
    ,GridStore = mongodb.GridStore;
module.exports=GridStore;