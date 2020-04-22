#!/usr/bin/ruby
# encoding: utf-8

require 'em-websocket'

# temporal "monkey patch"
class EM::WebSocket::Connection
  def remote_ip
    get_peername[2, 6].unpack('nC4')[1..4].join('.')
  end
end

def process_msg(msg, wsc)
  puts "msg from #{wsc.remote_ip}:#{msg}"
  words = msg.split(' ')
  
  answer = (eval words[1] + words[0] + words[2]).to_s + "\r\n"
  wsc.send answer
  puts 'Answer: ' + answer
end

EM.run do
  @concurrent_client_count = 0
  EM::WebSocket.run(host: '0.0.0.0', port: 28563) do |ws|
    ws.onopen do |handshake|
      @concurrent_client_count += 1
      puts "#{@concurrent_client_count} concurrent clients are connected"
    end

    ws.onclose { @concurrent_client_count -= 1 }

    ws.onmessage do |query|
      ProcessMsg(query, ws)
    end
  end
end




