#!/usr/bin/ruby
# encoding: utf-8

require 'em-websocket'
require_relative 'client'

# temporal "monkey patch"
class EM::WebSocket::Connection
  def remote_ip
    get_peername[2, 6].unpack('nC4')[1..4].join('.')
  end
end

def process_msg(msg, wsc)
  client = @clients.filter { |cl| cl.wss == wsc }.first
  puts "msg from #{client.name.empty? ? 'NONAME' : client.name}: #{msg}"
  case client.state
  when 0
    words = msg.strip.split(' ')
    case words[0]
    when 'set_login'
      if client.name.empty? && words.length > 1
        client.name = words[1]
        wsc.send "Login set to #{client.name}"
      end
    when 'send'
      if words.length == 3 && @clients.any? { |c| c.name == words[1] } &&
         (client.len = Integer(words[2])) && client.len.positive?
        client.state = 1
        @msgs_in_transfer[client.name] = words[1]
        wsc.send "User #{client.name} state switched to #{client.state}"
      else
        wsc.send "User #{words[1]} not found"
      end
    when 'receive'
      client.state = 2
    else
      wsc.send 'Unknown command'
    end
  when 1
    client.len -= 1
    cl = @clients.filter { |c| c.name == @msgs_in_transfer[client.name] }.last
    cl.wss.send msg unless cl.nil?
    if client.len.zero?
      client.state = 0
      @msgs_in_transfer.delete client.name
      wsc.send "User #{client.name} state switched to #{client.state}"
    end
  when 2
    puts 'Not implemented.'
    client.state = 0
  end

  #answer = (eval words[1] + words[0] + words[2]).to_s + "\r\n"
  #wsc.send answer
  #puts 'Answer: ' + answer
end

@clients = []
@msgs_in_transfer = {}


EM.run do
  @concurrent_client_count = 0
  EM::WebSocket.run(host: '0.0.0.0', port: 28563) do |ws|
    ws.onopen do |handshake|
      @clients << Client.new(ws)
      @concurrent_client_count += 1
      puts "#{@concurrent_client_count} concurrent clients are connected"
    end

    ws.onclose { @concurrent_client_count -= 1 }

    ws.onmessage do |query|
      process_msg(query, ws)
    end
  end
end




