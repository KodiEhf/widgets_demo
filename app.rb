# -*- coding: utf-8 -*-
require 'sinatra/base'
require 'sinatra/jsonp'
require 'sinatra/contrib'

class App < Sinatra::Base
  helpers Sinatra::Jsonp
  helpers Sinatra::JSON
  
  configure do
    set :app_file, __FILE__
    set :port, ENV['PORT']
  end
  
  get '/' do
    redirect '/index.html'
  end
  
  get '/data' do
    data = [{ :symbol   => "HFF140915",
              :yield    => Random.rand(1.0),
              :buy      => Random.rand(1000.0),
              :sell     => Random.rand(1000.0),
              :price    => Random.rand(1000.0),
              :turnover => Random.rand(1000000000) },
            { :symbol   => "HFF240215",
              :yield    => Random.rand(1.0),
              :buy      => Random.rand(1000.0),
              :sell     => Random.rand(1000.0),
              :price    => Random.rand(1000.0),
              :turnover => Random.rand(1000000000) },
            { :symbol   => "HFF250215",
              :yield    => Random.rand(1.0),
              :buy      => Random.rand(1000.0),
              :sell     => Random.rand(1000.0),
              :price    => Random.rand(1000.0),
              :turnover => Random.rand(1000000000) },
            { :symbol   => "HFF260215",
              :yield    => Random.rand(1.0),
              :buy      => Random.rand(1000.0),
              :sell     => Random.rand(1000.0),
              :price    => Random.rand(1000.0),
              :turnover => Random.rand(1000000000) }
           ]
    lang = params['lang']
    retval = {
      :columns => {
        "symbol" => {
          :type => "string",
          :name => lang == 'is' ? "Merki" : "Symbol" },
        "yield" => {
          :type => "float",
          :name => lang == 'is' ? "Krafa" : "Yield" },
        "buy" => {
          :type => "ccy", 
          :name => lang == 'is' ? "Kaup" : "Buy" },
        "sell" => { 
          :type => "ccy",
          :name => lang == 'is' ? "Sala" : "Sell" },
        "price" => {
          :type => "ccy",
          :name => lang == 'is' ? "Verð" : "Price" },
        "turnover" => { :type => "int",
          :name => lang == 'is' ? "Velta" : "Turnover" } },
      :data => []}
                             

    if params.has_key?('key') then
      if params['key'] != "a53b6605-3446-4a3a-bbbc-b7b902c62f16" then
        halt 403
      end
    else
      halt 403
    end

    # Very stupid filter!
    if params.has_key?('set') then
      retval[:data] = params['set'].split(',').map { |e|
        data.find { |d| d[:symbol] == e }
      }
    end

    if params.has_key?('callback') then
      jsonp retval
    else
      json retval
    end
  end

  run! if app_file == $0

end
