module PostsHelper
 def tag_cloud(tags, classes)
 	
 	tags.each do |tag|
 		#index = tag.count.to_f / max.count * (classes.size-1)
 		color = rand(1..5)
 		classes = 'tag'
 		classes = classes + color.to_s
 		yield(tag, classes)
 		
 	end	
 end
end
#yield(tag, classes[index.round])
