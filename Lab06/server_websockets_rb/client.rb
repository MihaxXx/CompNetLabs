class Client
  attr_accessor :wss, :state, :name, :len
  def initialize(ws)
    @wss = ws
    @state = 0 # 0 - command, 1 - transmit, 2 - receive
    @name = ''
    @len = 0
  end
end
