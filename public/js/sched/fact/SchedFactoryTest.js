test.factory('SchedFactory',
[
    '$resource',
	'$rootScope',
    function($resource,$rootScope){
		
        return  {
			
            users: $resource('https://api.wheniwork.com/2/users',
            {
                'location_id': '@location_id'
            },null),
			
            user: $resource('https://api.wheniwork.com/2/users/:id',
            {
                id: '@id'
            },null),
			
            shifts: $resource('https://api.wheniwork.com/2/shifts',
            {
                'location_id': '@location_id',
                'user_id': '@user_id'
                
            },
			{
				create:
				{
					method:"POST",
					params: 
					{
						color: '@color',
						created_at: '@created_at',
						creator_id: '@creator_id',
						end_time: '@end_time',
						location_id: '@location_id',
						notes: '@notes',
						position_id: '@position_id',
						published: '@published',
						published_date: '@published_date',
						start_time: '@start_time',
						user_id: '@user_id'
					},
					headers:
					{
						'Content-Type':'application/json',
						'W-Token': '@W-Token'
					}
				}
			}),
			
            locations: $resource('https://api.wheniwork.com/2/locations',
            null,null),
			
            positions: $resource('https://api.wheniwork.com/2/positions',
            null,null),
			
			blocks: $resource('https://api.wheniwork.com/2/blocks',
			null,null),
			
			user_settings: $resource('/users',
			null,
			{
				put:{
					method: 'PUT'
					
				}
			}),
			
			new_shifts: $resource('/shifts/:user_id/:date',
			{
				'user_id': '@user_id',
				'date': '@date'
			},
			{
				put:{
					method: 'PUT'
					
				}
			})
            
        };
}]);

