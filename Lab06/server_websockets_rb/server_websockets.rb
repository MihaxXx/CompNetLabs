#!/usr/bin/ruby
# encoding: utf-8

require 'em-websocket'

EM.run do
  @concurrentClientCount = 0
  EM::WebSocket.run(:host => "0.0.0.0", :port => 28563) do |ws|
    ws.onopen do |handshake|
      @concurrentClientCount += 1
      puts "#{@concurrentClientCount} concurrent clients are connected"
    end

    ws.onclose { @concurrentClientCount -= 1 }

    ws.onmessage do |query|
      puts "Data received: "+query
      words = query.split(" ")
      answer = (eval words[1]+words[0]+words[2]).to_s + "\r\n"
      ws.send answer
      puts "Answer: "+answer
    end
  end
end
