<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_id' => $this->menu_id,
            'name' => $this->name,
            'price' => $this->price,
            'availability' => $this->availability,
            'image_url' => $this->image_path ? Storage::disk('public')->url($this->image_path) : null,
        ];
    }
}
