


const monitors = [
  // todo: translate monitor codes?
  {code:'stun', letter: 'S'},
  {code:'physical', letter: 'P'},
]

export class Damage{
  static monitor(code) {
    return monitors.find(m => m.code == code) ?? monitors[0]
  }
  static letter(code) {
    return Damage.monitor(code).letter
  }
}