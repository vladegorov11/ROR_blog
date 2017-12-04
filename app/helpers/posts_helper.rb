module PostsHelper
 def tag_cloud(tags, classes)
 	max = tags.sort_by(&:count).last
 	tags.each do |tag|
 		#index = tag.count.to_f / max.count * (classes.size-1)
 		color = rand(1..5)
 		classes = classes + color.to_s
 		yield(tag, classes)
 		classes = 'tag'
 	end	
 end
end
#yield(tag, classes[index.round])
