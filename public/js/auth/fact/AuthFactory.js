wiwApp.factory('AuthFactory',
[
    '$resource','$http', 
    function($resource,$http){
        
        var key;
       // $http.get('/key').then(
        //function(doc){
         //   console.log(doc);
       //     key = doc.WKey;
            return  {
                wiwLogin: $resource('https://api.wheniwork.com/2/login',null,{
                    login:
                    {
                        method:'POST',
                        headers:
                        {
                            'Content-Type':'application/json',
                             'W-Key': '@key'
                        }
                    }
                }),
                getKey: $resource('/key',null,null),
                authSesh: $resource('/login', null, {
                    authed:
                    {
                        method:'POST',
                        headers:
                        {
                           // 'Content-Type':'application/json'
                        }
                    }
                })
            };
       // },function(err){
      //      return {};
      //  });
      
}]);

