<?php

use App\Mcp\Servers\TomatoServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/tomato', TomatoServer::class)->middleware('auth:sanctum');
