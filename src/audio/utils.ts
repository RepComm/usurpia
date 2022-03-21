
export function loadAudioFile (url: string, ctx: AudioContext): Promise<AudioBuffer> {
  return new Promise(async (_resolve, _reject)=>{
    try {
      let response = await fetch(url);
      let data = await response.arrayBuffer();
      let audio = await ctx.decodeAudioData(data);
      _resolve(audio);
      return;
    } catch (ex) {
      _reject(ex);
      return;
    }
  })
}
