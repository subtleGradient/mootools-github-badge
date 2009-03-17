SubtleTemplate.GitHubBadge = new Class({
	
	Implements: [Options, Events],
	
	options:{
		username: 'subtleGradient',
		templateElement: 'github-badge-template',
		element: 'github-badge',
		filterData: function(data){ return data.user.repositories; }
	},
	
	initialize: function(options){
		this.setOptions(options);
		var self = this;
		
		self.uid = SubtleTemplate.GitHubBadge.badges.length;
		SubtleTemplate.GitHubBadge.badges[self.uid] = self;
		
		window.addEvent('domready', self.requestData.bind(this));
	},
	
	requestData: function(){
		new Element('script', {src: 'http://github.com/api/v1/json/'+ this.options.username +'?callback='+ this.toString() +'.setData' })
			.inject(this.toElement(), 'after');
	},
	
	toString: function(){
		return 'SubtleTemplate.GitHubBadge.badges['+ this.uid +']';
	},
	
	toElement: function(){
		this.element || (this.element = $(this.options.element));
		this.Template = this.Template || new SubtleTemplate($(this.options.templateElement));
		return this.element;
	},
	
	setData: function(data){
		console.log('setData')
		this.toElement().empty().adopt(new this.Template(this.options.filterData(data)));
		return this.fireEvent('change');
	}
	
});
SubtleTemplate.GitHubBadge.Fade = new Class({
	
	Extends: SubtleTemplate.GitHubBadge,
	
	options:{
		tween:{
			speed:'slow'
		}
	},
	
	setData: function(data){
		console.log('Fade:setData')
		var el = this.toElement().empty();
		var rows = new this.Template(this.options.filterData(data));
		rows = rows.reverse();
		var self = this;
		function addRow(){
			if (!rows.length) return self.fireEvent('change');
			$(rows.pop())
				.fade('hide')
				.inject(el, 'top')
				.set('tween', $merge(self.options.tween, { onStart:addRowDelayed }))
				.fade('in')
			;
		};
		addRowDelayed = addRow.create({ delay:20 });
		
		addRow();
		return this;
	}
	
});
SubtleTemplate.GitHubBadge.badges = [];

SubtleTemplate.GitHubBadge.Basic = new Class({
	
	Extends: SubtleTemplate.GitHubBadge.Fade,
	
	options:{
		theme:'white',
		// list_length:10 // TODO: implement list_length
	},
	
	toElement: function(){
		if (!this.element){
			if (this.options.theme == 'white') this.options.theme = '';
			$(this.options.element).set('html','\
				<div class="repos">\
					<ul id="repo_listing">\
					</ul>\
				</div>\
				<style type="text/css" media="screen">\
					@import "http://drnicjavascript.rubyforge.org/github_badge/dist/ext/stylesheets/'+ this.options.theme +'badge.css";\
					#github-badge li .description {display:none}\
					#github-badge li {cursor:pointer}\
					#github-badge li.show-description .description {display:block}\
					#github-badge #repo_listing {display:block; height:300px; overflow:auto}\
				</style>\
			');
			this.addEvent('change', function(){
				$(this).getElements('li').addEvent('click', this.toggleDescription);
			});
		}
		this.Template = this.Template || new SubtleTemplate({ html:'\
			<li title="{description}" class="public">\
				<img src="http://github.com/images/icons/public.png" />\
				<strong>\
					<a href="{url}">\
						{name}\
					</a>\
				</strong>\
				<p class="description">{description}</p>\
			</li>\
		'});
		return this.element || (this.element = $('repo_listing'));
	},
	
	toggleDescription: function(e){
		var c = 'show-description';
		this.hasClass(c) ? this.removeClass(c) : this.addClass(c);
	}
	
});
