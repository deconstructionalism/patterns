const sentences = `Are you saying that console.log output shows up, but process.stdout.write doesn't? I wouldn't expect process.stdout.write output to show up, because node2 isn't listening to the process.stdout. It only gets log messages over the debug socket from console.log.

You can check this by running with node --inspect --debug-brk and navigating to that URL in Chrome - then you won't see those messages in chrome devtools either. But if you are running 'console.log' and it doesn't show up, that's a problem, and I'd like to know if there's a difference between what you see in chrome devtools vs vscode.`

const russianTranslation = sentences.split(' ').flatMap(word => {
  if (['that', 'the', 'to', 'a', 'you', 'i', 'it'].includes(word.toLowerCase())) {
    return []
  }
  if(['ing', 'it'].some(suffix => word.endsWith(suffix)))
   return []
  return word
}).join(' ')

console.log(russianTranslation)