var gallery = null;
var pageOffset = '';
var isLoading = false;
var tierList = [0, 5.99, 19.99];

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function getMenuString(deviceString){
	return deviceString.toUpperCase().replace(' ', '');
}

function createTemplateCard(link, extLink, images, title, description, profileUrl, authorDetail, price){
	var row = $('<div>').addClass('grid-item');
	var cover = (images&&images.length>0)?images[0].url:'';
	var priceElm = 'Free';

	if(price){
		var light = $('<span>').addClass('price-light-text');
		var dim = $('<span>').addClass('price-dim-text');
		priceElm = $('<span>').append(light).append(dim);
		$.each(tierList, function(index, t){
			if(price > t){
				light.html(new Array(index + 2).join( '$' ));
				dim.html(new Array(4 - (index + 1)).join( '$' ));
			}
		});
	}

	var el = document.createElement('a');
	el.href = extLink;

	var previewImageDiv = $('<div>').addClass('preview-image').appendTo(row);
	var previewLink = $('<a>').attr({'href': link, 'target': '_blank'}).appendTo(previewImageDiv);
	var previewImage = $('<img>').attr({'src': cover}).appendTo(previewLink);

	var infoSection = $('<div>').addClass('info').appendTo(row);

	var infoLeft = $('<div>').addClass('info-left').appendTo(infoSection);
	
	$('<div>').addClass('title').append($('<a>').attr({'href': link, 'target': '_blank'}).html(title)).appendTo(infoLeft);
	$('<div>').addClass('description').append($('<a>').attr({'href': link, 'target': '_blank'}).html(description)).appendTo(infoLeft);
	$('<div>').addClass('link').append($('<a>').attr({'href': link, 'target': '_blank'}).html(el.hostname)).appendTo(infoLeft);

	var authorSection = $('<div>').addClass('author-section').appendTo(infoLeft);

	$('<div>').addClass("profile-picture").append($('<img>').attr({src: profileUrl})).appendTo(authorSection);
	$('<div>').addClass("author-text").html(authorDetail).appendTo(authorSection);

	var infoRight = $('<div>').addClass('info-right').html(priceElm).appendTo(infoSection);
	if(price){
		infoRight.addClass('price');
	}else{
		infoRight.addClass('free');
	}

	return row;
}

function getTemplate(deviceType, offset, keyword){
	var container = $('#templateContainer');

	if(pageOffset != 'END'){
		isLoading = true;
		$('#imgLoader').show();

		$.ajax({
	        url: 'https://api.magicsketch.io/r/get_web_template?device='+deviceType+'&offset='+offset,
	        method: "GET",
	        dataType: "json",
	        complete: function(json){
	        	isLoading = false;
	        	$('#imgLoader').hide();
	        },
	        success: function(json){
	        	pageOffset = json.offset || 'END';

	        	if(json.records && json.records.length > 0){
	        		$.each(json.records, function(index, r){
	        			var card = new createTemplateCard('/template/'+slugify(r.fields["Name"]), r.fields["URL"], r.fields["Preview"], r.fields["Name"], '', '/images/profile.png', r.fields["Author"]+'<br/>iOS, MAC', r.fields["Price"]);
	        			gallery.append(card).masonry( 'appended', card);
	        		});

		            gallery.imagesLoaded().progress( function() {
						gallery.masonry('layout');
					});
	        	}

	        	if (pageOffset == 'END'){
	        		$('#footerSubmitButton').show();
	        	}

	        },
	        error: function(e){
	            
	        }
	    });
	}
}

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}


$(document).ready(function(){
	var deviceType = getParameterByName("device") || '';

	getTemplate(deviceType, pageOffset, '');

	gallery = $('.grid').masonry({
		// options
		itemSelector: '.grid-item',
		columnWidth: '.grid-sizer',
		gutter: 20,
		percentPosition: true
	});

	$('[category="'+getMenuString(deviceType==''?'All':deviceType)+'"]').addClass('active');

	$('#navToggleButton').click(function(e){
		$('#navMenu').slideToggle(200);
	});

	$('.search-input').on('keypress', function(e){
        if (e.keyCode == 13) {
            var box = $(e.target);
            box.blur();

            $('.search-input').val(box.val());

            pageOffset = '';
            
            getTemplate(deviceType, pageOffset, box.val());
        }
    });

	$(window).scroll(function() {
		if($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !isLoading) {
			getTemplate(deviceType, pageOffset, '');
		}
	});

	if($('.preview-section').length > 0){
		$('.preview-section').on('mouseenter', function(e){
			$('.social').addClass('visible');
		}).on('mouseleave', function(e){
			$('.social').removeClass('visible');
		});
	}

});