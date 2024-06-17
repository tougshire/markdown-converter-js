function renderMarkdown( source ) {

	var sourceLines = source.split("\n")
	var ignorLines=false
	var liLevel = 0
	var liPrevLevel = 0
	var hnLevel
	var commentParts
	var ignoreLines = false
	sourceLines.unshift("")

	for ( var y = 1; y < sourceLines.length; y++ ) {

		console.log('^ ' + y + ' ' + sourceLines[y])
		commentParts = sourceLines[y].match(/(<!\-\-).*(\-\->)/)
		if(commentParts) {
			console.log('skipping comment at line ' + y)
			continue 
		}

		commentParts = sourceLines[y].match(/^(.*)(<!\-\-.*)$/)
		if(commentParts ) {
			if(commentParts[1]) {
				sourceLines[y] = commentParts[1]
				sourceLines.splice(y+1,0,commentParts[2])
				y--
				continue
			} else {
				console.log('turning on ignore at line ' + y )
				ignoreLines = true
			}
		}


		commentParts = sourceLines[y].match(/^(.*\-\->)(.*)$/) 
		if(commentParts ) {
			if(commentParts[2]) {
				sourceLines[y] = commentParts[1]
				sourceLines.splice(y+1,0,commentParts[2])
				y--
				continue
			} else {
				console.log('turning off ignore at line ' + y )
				ignoreLines = false
			}
		}

		if(!ignoreLines) {
			if(sourceLines[y].match(/^\=+$/)) {
				sourceLines[y-1] = '<h1>' +  sourceLines[y-1] + '</h1>'
				sourceLines.splice(y,1)
				y--
				continue
			}
			if(sourceLines[y].match(/^\-+$/)) {
				sourceLines[y-1] = '<h2>' +  sourceLines[y-1] + '</h2>'
				sourceLines.splice(y,1)
				y--
				continue
			}

			var hnParts = sourceLines[y].match(/^(#+) (.*)/)
			if(hnParts) {
				hnLevel = hnParts[1].length
				sourceLines[y] = '<h' + hnLevel + '>' +  hnParts[2] + '</h' + hnLevel + '>'
			}

			var liParts = sourceLines[y].match(/^(\*+) (.*)/)
			if(liParts) {
				liPrevLevel = liLevel
				liLevel=liParts[1].length
				if(liLevel > liPrevLevel) {
					sourceLines[y]='<ul><li>' + liParts[2] + '</li>'
				}
				if(liLevel == liPrevLevel) {
					sourceLines[y]='<li>' + liParts[2] + '</li>'
				}
				if(liLevel < liPrevLevel) {
					sourceLines[y]='</ul>'.repeat(liPrevLevel - liLevel) + '<li>' + liParts[2] + '</li>'
				}
				liParts=null
			} else {
				if(liLevel > 0) {
					sourceLines[y]='</ul>'.repeat(liLevel) + sourceLines[y]
					liLevel=0
				}
			}

			if(sourceLines[y]=='') { 
				if ( sourceLines[y-1] > '' && !(sourceLines[y-1].match(/^</)) && y > 1 ) {
					for ( w = y-2; w > -1; w-- ) {

						if(sourceLines[w].match(/^<(p|h\d|ol|ul|li)/) ) {
							break
						}
						if(sourceLines[w] == '') {
							sourceLines[w] = '<p>'
							sourceLines[y] = '</p>'
							break
						}
						if( w == 0 ) {
							sourceLines[0] = sourceLines[0] + '<p>'
						}
					}
				}
			}
			
			sourceLines[y] = sourceLines[y]
				.replaceAll(/!(?<!\\)\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
				.replaceAll(/(?<!\\)\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
				.replaceAll(/(?<!\\)(\*)(?<!\\)(\*)(?<content>.*?)(?<!\\)(\*)(?<!\\)(\*)/g, '<strong>$<content></strong>')
				.replaceAll(/(?<!\\)(\*)(?<content>.*?)(?<!\\)(\*)/g, '<em>$<content></em>')
				.replace(/(?<=.+)(\/|  )$/, '<br>') 
				.replaceAll(/(\\)(?!\\)/g,'')
		}
	}


	var combinedLines = ""
	for (var y=0; y < sourceLines.length; y++) {
		combinedLines = combinedLines + sourceLines[y]
	}
	location.innerHTML = combinedLines
	return combinedLines
}
