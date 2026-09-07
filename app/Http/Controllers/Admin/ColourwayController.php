<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Colourway;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ColourwayController extends Controller
{
    /**
     * Colourways are shared across the catalogue, so a change here shows up on
     * every product that offers it. That is the point: Butter is one butter.
     */
    public function update(Request $request, Colourway $colourway): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:40'],
            'cloth' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'ink' => ['required', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ], [
            'cloth.regex' => 'The cloth colour must be a hex value such as #f2e7b7.',
            'ink.regex' => 'The print colour must be a hex value such as #271814.',
        ]);

        $colourway->update([
            'name' => $data['name'],
            'cloth' => strtolower($data['cloth']),
            'ink' => strtolower($data['ink']),
        ]);

        return back()->with('success', "{$colourway->name} updated everywhere it is used.");
    }
}
