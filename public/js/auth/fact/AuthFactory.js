wiwApp.factory('AuthFactory',
[
    '$resource', 
    function($resource){
        return  {
            wiwLogin: $resource('https://api.wheniwork.com/2/login',null,{
                login:
                {
                    method:'POST',
                    headers:
                    {
                        'Content-Type':'application/json',
                        'W-Key':'580dfbc2e8a2b604ad6cac26e9500c1bd22c7ec9'
                    }
                }
            }),
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
}]);

