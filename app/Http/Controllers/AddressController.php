<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Services\AddressService;
use App\Http\Resources\AddressResource;
use App\Http\Requests\StoreAddressRequest;
use App\Http\Requests\UpdateAddressRequest;
use Exception;
use Illuminate\Http\JsonResponse;

class AddressController extends Controller
{
    public function __construct(protected AddressService $addressService) {}

    public function index(): JsonResponse
    {
        $addresses = $this->addressService->index();

        return $this->successResponse(
            'Addresses fetched successfully',
            AddressResource::collection($addresses),
            200,
            $this->pagination($addresses),
        );
    }

    public function store(StoreAddressRequest $request): JsonResponse
    {
        try {
            $address = $this->addressService->store($request->validated());
            return $this->successResponse('Address created successfully', new AddressResource($address), 201);
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function update(UpdateAddressRequest $request, Address $address): JsonResponse
    {
        try {
            $address = $this->addressService->update($address, $request->validated());
            return $this->successResponse('Address updated successfully', new AddressResource($address));
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }

    public function destroy(Address $address): JsonResponse
    {
        try {
            $this->addressService->destroy($address);
            return $this->successResponse('Address deleted successfully');
        } catch (Exception $exception) {
            return $this->errorResponse($exception->getMessage(), null, $exception->getCode());
        }
    }
}
