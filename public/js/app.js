var wiwApp = angular.module('WIW',
    [
        'ngMaterial',
        'ngMessages',
        'ngAnimate',
        'ngSanitize',
        'ngResource',
        'ngCookies',
        'ui.router',
        'ui.bootstrap',
		'ui.bootstrap.contextMenu',
		'sprintf',
		'ngMdIcons',
		'ui.grid',
		'ui.grid.resizeColumns',
		'ui.grid.edit',
		'ui.grid.selection',
		'ui.grid.cellNav'
    ]

).run(
[	
    '$rootScope','$state','$stateParams',
    function($rootScope,  $state,  $stateParams)
    {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
		$rootScope.site_title = "When I Work SpreadSheets";
    }
]).config(
[
    '$stateProvider','$urlRouterProvider', '$mdThemingProvider', 
    function($stateProvider, $urlRouterProvider,$mdThemingProvider)
    {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state("login", 
        {
            url: '/',
            controller: 'AuthCtrl',
            templateUrl: 'html/auth/login.html'
              
        }).state("schedule",
        {
            url: '/schedule',
            
			
			views:{
				
				'':{
					templateUrl: 'html/sched/schedule.html',
					controller: 'SchedCtrl'
				},
				'shifts@schedule': {
					
					templateUrl: 'html/sched/accord.html'
				}
			}
            
        })
		.state("grid",
		{
			abstract: true,
			url:'/grid',
			views: 
			{
				'':{
					templateUrl: 'html/sched/schedule.html',
					
					controller: 'GridCtrl'
				},
				'shifts@grid':{
					templateUrl: 'html/sched/grid.html'
				}
			}
			
		})
		.state('grid.site',
		{
			url: '/:site'		
		})
		.state("logout",
        {
            url: '/logout',
            template: '<h2 ng-init="logout()">Logout</h2>',
			controller: 'AuthCtrl'
        });
        
        $mdThemingProvider.theme('login')
            .primaryPalette('green')
            .warnPalette('red')
            .backgroundPalette('grey');
    
		$mdThemingProvider.theme('default')
			.primaryPalette('green')
			.accentPalette('light-green')
			.warnPalette('red')
			.backgroundPalette('blue-grey');
	
		$mdThemingProvider.theme('dates')
			.primaryPalette('grey')
			.backgroundPalette('grey');;
			
				
    }
]);