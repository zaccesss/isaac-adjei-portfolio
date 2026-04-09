<? /* Template Name: index page template */ ?>
<? get_header() ?>
<main class="page">
	<div data-anim-index class="index">
		<? 
		/*
		$fields = get_anim_fields($page_id);
		if($fields){
			foreach ($fields as $key => $value) { 
				if ( $fields[$key] && $fields[$key]['enable'] ) {
					get_template_part('components/index/'.$key, null, array(
						'content' =>  $fields[$key]
					));
				}
			}
		}*/
		?>
	</div>
</main>
<? get_footer() ?>
<?
// the_title( '<h1 class="title">', '</h1>' );
// anim_post_thumbnail();
// the_content();
// the_ID();
// post_class();
?>