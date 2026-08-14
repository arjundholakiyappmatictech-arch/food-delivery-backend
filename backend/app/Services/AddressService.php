<?php

namespace App\Services;

use App\Exceptions\Address\AddressLimitExceededException;
use App\Exceptions\Address\DefaultAddressCannotBeUnsetException;
use App\Exceptions\Address\DuplicateAddressException;
use App\Exceptions\Address\LastAddressCannotBeDeletedException;
use App\Models\Address;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AddressService
{
    public function index(array $data): LengthAwarePaginator
    {
        /** @var User $user */
        $user = Auth::user();

        $this->ensureCustomer($user);

        $search = trim($data['q'] ?? '');

        $operator = config('database.default') === 'pgsql' ? 'ilike' : 'like';

        $searchTerms = preg_split('/\s+/', $search, -1, PREG_SPLIT_NO_EMPTY);

        $searchTerms = array_slice($searchTerms ?: [], 0, 5);

        return $user
            ->addresses()
            ->select(['id', 'user_id', 'label', 'address_line', 'city', 'state', 'pincode', 'latitude', 'longitude'])
            ->when($searchTerms, function ($query) use ($searchTerms, $operator) {
                foreach ($searchTerms as $term) {
                    $query->where(function ($query) use ($term, $operator) {
                        $query
                            ->where('label', $operator, "%{$term}%")
                            ->orWhere('address_line', $operator, "%{$term}%")
                            ->orWhere('city', $operator, "%{$term}%")
                            ->orWhere('state', $operator, "%{$term}%")
                            ->orWhere('pincode', $operator, "%{$term}%");
                    });
                }
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    public function store(array $data): Address
    {
        $user = Auth::user();

        $this->ensureCustomer($user);

        $this->addressLimitCheck($user);

        $this->duplicateAddressCheck($user, $data);

        $hasAddress = Address::query()->where('user_id', $user->id)->exists();

        return Address::create([
            'user_id' => $user->id,
            'label' => $data['label'],
            'address_line' => $data['address_line'],
            'city' => $data['city'],
            'state' => $data['state'],
            'pincode' => $data['pincode'],
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'is_default' => !$hasAddress,
        ]);
    }

    public function update(Address $address, array $data): Address
    {
        $user = Auth::user();

        $this->ensureCustomer($user);

        $this->authorize($address, $user);

        if (array_key_exists('is_default', $data) && $data['is_default'] === false && $address->is_default) {
            throw new DefaultAddressCannotBeUnsetException();
        }

        $updatedData = array_merge(
            [
                'address_line' => $address->address_line,
                'city' => $address->city,
                'state' => $address->state,
                'pincode' => $address->pincode,
            ],
            $data,
        );

        $this->duplicateAddressCheck($user, $updatedData, $address);

        return DB::transaction(function () use ($user, $address, $data): Address {
            if (($data['is_default'] ?? false) === true) {
                Address::query()
                    ->where('user_id', $user->id)
                    ->whereKeyNot($address->id)
                    ->update([
                        'is_default' => false,
                    ]);
            }

            $address->update($data);

            return $address;
        });
    }

    public function destroy(Address $address): void
    {
        $user = Auth::user();

        $this->ensureCustomer($user);

        $this->authorize($address, $user);

        DB::transaction(function () use ($user, $address): void {
            $addressCount = Address::query()->where('user_id', $user->id)->count();

            if ($addressCount === 1) {
                throw new LastAddressCannotBeDeletedException();
            }

            $wasDefault = $address->is_default;

            $address->delete($address);

            if ($wasDefault) {
                $newDefaultAddress = Address::query()->where('user_id', $user->id)->latest('id')->first();

                if ($newDefaultAddress) {
                    $newDefaultAddress->update([
                        'is_default' => true,
                    ]);
                }
            }
        });
    }

    private function ensureCustomer(User $user): void
    {
        if ($user->type !== 'customer') {
            throw new AuthorizationException('only customer can able to manage address', 403);
        }
    }

    private function authorize(Address $address, User $user): void
    {
        if ($address->user_id !== $user->id) {
            throw new AuthorizationException('You are not authorized to access this address', 403);
        }
    }

    private function duplicateAddressCheck(User $user, array $data, ?Address $currentAddress = null): void
    {
        $query = Address::query()
            ->where('user_id', $user->id)
            ->where('address_line', $data['address_line'])
            ->where('city', $data['city'])
            ->where('state', $data['state'])
            ->where('pincode', $data['pincode']);

        if ($currentAddress) {
            $query->whereKeyNot($currentAddress->id);
        }

        if ($query->exists()) {
            throw new DuplicateAddressException();
        }
    }

    private function addressLimitCheck(User $user, int $limit = 3): void
    {
        $addressCount = Address::query()->where('user_id', $user->id)->count();

        if ($addressCount >= $limit) {
            throw new AddressLimitExceededException($limit);
        }
    }
}
