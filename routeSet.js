/*
get 路由配置
*/
var routeSetGet={
    "/login":{"htmlPath":"./html/1.html"}
};
/*
post 路由配置
*/
var routeSetPost={
    "/api/postData":{"name":"数据接口"},
    "/api/fileData":{
        "name":"文件接口",
        "rootPath":"/home/helloword/public/uploads/",
        "fileName":"avatar",//file文件name名字
        "fileSize":10*1024*1024,//10M
        "suffixList":['.jpg'],
    },
};
/*
异常路由配置
*/
var routeSetException={
    "*":{
        "htmlPath":"./html/error.html",
    }
};
module.exports={
    "routeSetGet":routeSetGet,
    "routeSetPost":routeSetPost,
    "routeSetException":routeSetException
};