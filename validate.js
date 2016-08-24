;(function(){
	window.validate={}

	function trim(str){
		return str.trim ? str.trim() : str.replace(/(^\s*)|(\s*$)/g,"")
	}

	function addEvent(o,type,callback){
		if(o.addEventListener){
			o.addEventListener(type,callback,false)
		}else if(o.attachEvent){
			o.attachEvent('on'+type,callback)
		}
	}

	function getSync(url,data){
		var xhr=window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		xhr.open('GET',url+data+'&random='+Math.random(),false)
		xhr.send(null)
		return xhr.responseText;
	}

	function checkItem(id,items){
		var ipt=document.getElementById(id)
		var rules=items[id]
		var val=trim(ipt.value)
		for(var i=0,len=rules.length;i<len;i++){
			var rule=rules[i][0]
			var msg=rules[i][1]
			if(typeof rule=='string'){
				var _rule=rule.split(':')
				if(_rule.length==1){
					if(_rule[0]=='required'){
						if(val=='') return {"error":1,"id":id,"msg":msg}
					}
				}else if(_rule.length==2){
					var cmd=_rule[0]
					var arg=_rule[1]
					switch(_rule[0]){
						case "minlength":
							if(val.length<arg) return {"error":1,"id":id,"msg":msg}
							break;
						case "maxlength":
							if(val.length>arg) return {"error":1,"id":id,"msg":msg}
							break;
						case "equalTo":
							var _compare=trim(document.getElementById(arg).value)
							if(val!=_compare) return {"error":1,"id":id,"msg":msg}
							break;
						case "remote":
							var _res=getSync(arg,val)
							if(!_res || _res==0 || _res=='false') return {"error":1,"id":id,"msg":msg}
							break;
					}
				}
			}else if(typeof rule=='function'){
				if(!rule()){
					return {"error":1,"id":id,"msg":msg}
				}
			}else if(rule instanceof RegExp){
				if(!rule.test(val)){
					return {"error":1,"id":id,"msg":msg}
				}
			}
		}
		// 返回格式{"error":1,"id":"username","msg":"不能为空"}
		return {"error":0,"id":id}
	} 

	validate.init=function(config){
		var config=config || {}
		var formId=config.formId || ""	// 表单ID
		var form=document.getElementById(formId)
		var items=config.items  // 验证的所有项
		var pass=config.pass || null	// 全部验证通过回调
		var fall=config.fall || null	// 失败回调
		var success=config.success || null;	// 单项成功回调

		addEvent(form,'submit',function(e){
			if(e.preventDefault){
				e.preventDefault()
			}else{
				e.returnValue=false
			}
			var _state=true;
			for(var x in items){
				var res=checkItem(x,items);
				if(res.error){
					_state=false;
					if(!!fall) fall(res)
				}
			}
			if(!!_state){
				if(!!pass) pass(form)
			}
		})

		for(var x in items){
			var _ipt=document.getElementById(x);
			(function(i){
				addEvent(_ipt,'blur',function(){
					var res=checkItem(i,items);
					if(res.error){
						if(!!fall) fall(res)
					}else{
						if(!!success) success(res)
					}
				})
			})(x);
		}
	}

})();