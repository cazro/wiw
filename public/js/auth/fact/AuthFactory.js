wiwApp.factory('AuthFactory',
[
    '$resource', 
    function($resource){
        
        var key;
        $.getJSON('/js/var/wiw.json',function(obj){
            key = obj.WKey;
        })
        return  {
            wiwLogin: $resource('https://api.wheniwork.com/2/login',null,{
                login:
                {
                    method:'POST',
                    headers:
                    {
                        'Content-Type':'application/json',
                        'W-Key':key
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

