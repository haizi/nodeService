var routeSet = require('./routeSet');
var express = require('express');
var multer  = require('multer');
var http = require('http');
var fs = require('fs');
var app = express();
var path = require('path');
var extend = require('extend');
var querystring=require('querystring');
var bodyParser=require("body-parser");  
var moment = require('moment');
var uuidv4 = require('uuid/v4');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true,limit:"10240KB" }));  
/*
创建目录
*/
var createFolder = function(folder) {
    try {
        fs.accessSync(folder);
    } catch (e) {
        fs.mkdirSync(folder);
    }
};
/*
post 后台方法
data： 前台请求数据
config:{
   "host":"",//域名地址 
   "port":"",//域名端口
   "path":"",//接口地址
}
*/
function PostData(data,config,callBack){
    var dataSecret = {  
        username: 'foo',  
        password: "test"  
    }; 
    data=extend(true,dataSecret,data);
    var postData = JSON.stringify(data);  
    //postData="model="+postData;
    var options = {  
        method: "POST",  
        // host: "test.notaryexpress.cn",  
        // port: 8001,  
        // path: "/api/MyApi/test1",  
        headers: {  
            //"Content-Type": 'application/x-www-form-urlencoded',  
            "Content-Type": 'application/json',  
            "Content-Length": postData.length  
        }  
    };  
    options=extend(true,options,config);
    console.log(options); 
    var body = ''; 
    var request = http.request( options, function(res) {  
        // show results  
        var statusCode=res.statusCode;
        console.log(statusCode);
        if(statusCode==200){
            res.setEncoding('utf8');  
            res.on('data', function(chunk) {  
                body += chunk;
                console.log('BODY: ' + chunk);  
            });  
    
            res.on('end', function(err) {  
                console.log( ' complete.');  
                callBack(body);
            });  
        }else{
            callBack("");
        }
    });  
        request.on("error", function(e) {  
            console.log('upload Error: ' + e.message);  
            callBack("");
        });
        request.write(postData);
        request.end();
}
/*
设置get路由
*/
for(var itemGet in routeSet.routeSetGet){
    var value_Get=routeSet.routeSetGet[itemGet];
    app.get(itemGet, function(req, res, next) {
        res.writeHead(200,{'Content-Type':'text/html'})
        fs.readFile(value_Get.htmlPath,'utf-8',function(err,data){
            if(err){
                throw err;
            }
            res.end(data);
        });
    });
};
/*
设置post路由
*/
for(var itemPost in routeSet.routeSetPost){
    var value_Post=routeSet.routeSetPost[itemPost];
    if(value_Post.name=="文件接口"){
        app.post(itemPost, function (req, res) {
            console.log(req.body);
            var getValue=routeSet.routeSetPost[itemPost];
            createFolder(getValue.rootPath);
            var tempPath="/"+moment().format('YYYYMMDD')+'/';//文件存储路径
            var fileName=uuidv4()+'.jpg';
            var fileAfterPath=tempPath+fileName;
            createFolder(getValue.rootPath+tempPath);
             var storage = multer.diskStorage({
                destination: function (req, file, cb) {
                    cb(null, getValue.rootPath+tempPath)
                },
                filename: function (req, file, cb) {
                    cb(null, fileName)
                }
            });
            var upload = multer({ 
                storage: storage,
                limits: {fileSize:getValue.fileSize},
                fileFilter:function(req, file, cb){
                    var extname=path.extname(file.originalname);
                    var index_=getValue.suffixList.indexOf(extname);
                    if(index_==-1){
                        cb(new Error('不支持此文件'));
                    }else{
                        cb(null, true);
                    }
                }
             }).single(getValue.fileName);
            upload(req,res,function(err){
                var result={'state':'001','data':''};
                if(err){
                    if(err.code){
                        result.data=err.code;
                    }else{
                        result.data="不支持此文件";
                    }
                    res.end(JSON.stringify(result));
                }else{
                    console.log(req.file);
                    console.log(req.body);
                    result.state="000";
                    result.data=fileAfterPath;
                    res.end(JSON.stringify(result));
                }
            });
        });
    }else{
        app.post(itemPost, function(req, res) {
            var len=Object.keys(req.body).length;
            var result={
                "state":"001",
                "data":""
            };
            if(len>0){
                PostData(req.body.dataParams,req.body.configParams,function(data_){
                    if(data_){
                        result.state="000";
                        result.data=data_;
                    }else{
                        result.data="返回body参数为空";
                    }
                    res.end(JSON.stringify(result));
                });
            }else{
                result.data="未获取到任何参数";
                res.end(JSON.stringify(result));
            }
        });
    }
};
/*
设置异常路由
*/
for(var itemError in routeSet.routeSetException){
    var value_Error=routeSet.routeSetException[itemError];
    app.get(itemError, function(req, res, next) {
        res.writeHead(200,{'Content-Type':'text/html'})
        fs.readFile(value_Error.htmlPath,'utf-8',function(err,data){
            if(err){
                throw err;
            }
            res.end(data);
        });
    });
    app.post(itemError, function(req, res, next) {
        res.writeHead(200,{'Content-Type':'text/html'})
        fs.readFile(value_Error.htmlPath,'utf-8',function(err,data){
            if(err){
                throw err;
            }
            res.end(data);
        });
    });
};
app.listen(7000);
console.log("监听端口 7000");