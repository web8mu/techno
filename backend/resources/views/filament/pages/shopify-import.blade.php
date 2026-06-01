<x-filament-panels::page>
    <x-filament-panels::form>
        {{ $this->form }}
        <x-filament-panels::form.actions :actions="$this->getFormActions()" />
    </x-filament-panels::form>

    @if(!empty($preview))
    <x-filament::section heading="Preview (first 5 rows)">
        <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
                <thead class="bg-gray-100 dark:bg-gray-800">
                    <tr>@foreach(array_keys($preview[0]) as $col)<th class="px-3 py-2 font-medium">{{ $col }}</th>@endforeach</tr>
                </thead>
                <tbody>
                    @foreach($preview as $row)
                    <tr class="border-t border-gray-200 dark:border-gray-700">
                        @foreach($row as $cell)<td class="px-3 py-1.5 max-w-[150px] truncate">{{ $cell }}</td>@endforeach
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </x-filament::section>
    @endif

    @if($imported)
    <x-filament::section heading="Import Results">
        <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">{{ $results['created'] }}</div>
                <div class="text-sm text-green-700 dark:text-green-400">Created</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">{{ $results['updated'] }}</div>
                <div class="text-sm text-blue-700 dark:text-blue-400">Updated</div>
            </div>
            <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-red-600">{{ $results['skipped'] }}</div>
                <div class="text-sm text-red-700 dark:text-red-400">Skipped</div>
            </div>
        </div>
        @if(!empty($results['errors']))
        <div class="mt-4">
            <h4 class="font-medium mb-2 text-red-600">Errors:</h4>
            <ul class="list-disc list-inside space-y-1">
                @foreach($results['errors'] as $error)
                <li class="text-sm text-red-600">{{ $error }}</li>
                @endforeach
            </ul>
        </div>
        @endif
    </x-filament::section>
    @endif
</x-filament-panels::page>
