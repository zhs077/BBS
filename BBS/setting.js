/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-5-21
 * Time: 上午9:48
 * To change this template use File | Settings | File Templates.
 */

module.exports = {
    cookieSecret:'myblog'
    ,db:'blog'
    ,host:'localhost'
    ,mongodb_host:'127.0.0.1'
    ,mongodb_port:27017
    ,page_size:2
   , port:4000
   ,name:'XX论坛'
    ,pagesize_:5 //分页
    ,mail:{
        host: "smtp.qq.com",
        auth: {
            user: "xx@qq.com",
            pass: "xx"
        },
        port: 465 // smtp server port
        , domains: ["qq.com"], secureConnection: true
    }
    ,mailOptions:{
        from: "436062598@qq.com", // sender address
        to: "", // list of receivers
        subject: "", // Subject line
        html: ""
    }
    ,links:[
        {name:'百度',url:"http://baidu.com"},
        {name:'CNodeJs',url: "http://cnodejs.org/"},
        {name:'百度',url:"http://baidu.com"}

    ]


};

