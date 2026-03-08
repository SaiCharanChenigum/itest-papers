"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { ShoppingCart, Truck, Check } from "lucide-react"

// Mock book data
const BOOKS = [
    {
        id: "BOOK_9_BIO",
        title: "ICSE Class 9 Biology - Master Guide",
        price: 399,
        image: "/book-bio-9.jpg", // Placeholder
        description: "Complete chapter-wise notes and 500+ practice questions.",
        features: ["Spiral Bound", "High Quality Print", "Free Shipping"]
    },
    {
        id: "BOOK_9_CHEM",
        title: "ICSE Class 9 Chemistry - Master Guide",
        price: 399,
        image: "/book-chem-9.jpg",
        description: "Reaction mechanisms, periodic table charts, and solved examples.",
        features: ["Spiral Bound", "Color Diagrams", "Free Shipping"]
    },
    {
        id: "BOOK_10_BIO",
        title: "ICSE Class 10 Biology - Board Exam Special",
        price: 449,
        image: "/book-bio-10.jpg",
        description: "Previous 10 years solved papers and most likely board questions.",
        features: ["Exam Oriented", "Previous Year Papers", "Free Shipping"]
    },
    {
        id: "BOOK_10_CHEM",
        title: "ICSE Class 10 Chemistry - Board Exam Special",
        price: 449,
        image: "/book-chem-10.jpg",
        description: "Formula sheets, equation bank, and theory notes for quick revision.",
        features: ["Exam Oriented", "Formula Bank", "Free Shipping"]
    }
]

export default function BooksPage() {
    const [cart, setCart] = useState<string[]>([])
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        city: "",
        pincode: "",
        phone: ""
    })

    const addToCart = (id: string) => {
        if (!cart.includes(id)) {
            setCart([...cart, id])
        }
    }

    const removeFromCart = (id: string) => {
        setCart(cart.filter(c => c !== id))
    }

    const selectedBooks = BOOKS.filter(b => cart.includes(b.id))
    const totalAmount = selectedBooks.reduce((acc, b) => acc + b.price, 0)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        alert("Order functionality coming soon! This is a demo.")
        // Here we would call the order API
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-20">
            <div className="bg-[#0B3C49] text-white py-12 mb-12">
                <div className="container mx-auto px-4 md:px-6">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Physical Books Store</h1>
                    <p className="text-teal-100 max-w-2xl text-lg">
                        Prefer studying from hard copies? Order our high-quality spiral-bound notes and question banks delivered to your doorstep.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Products List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {BOOKS.map((book) => (
                                <Card key={book.id} className="border hover:shadow-lg transition-all flex flex-col">
                                    <div className="aspect-[3/4] bg-slate-200 relative overflow-hidden rounded-t-xl group">
                                        {/* Placeholder for book image */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-xl">
                                            {book.title.split("-")[0]}
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                                            {book.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2">
                                            {book.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <ul className="text-sm space-y-1 text-slate-600">
                                            {book.features.map(f => (
                                                <li key={f} className="flex items-center">
                                                    <Check className="w-3 h-3 text-teal-600 mr-2" /> {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter className="flex items-center justify-between border-t pt-4">
                                        <span className="text-2xl font-bold text-slate-900">₹{book.price}</span>
                                        {cart.includes(book.id) ? (
                                            <Button variant="outline" className="border-teal-500 text-teal-600 hover:bg-teal-50" onClick={() => removeFromCart(book.id)}>
                                                Added to Cart
                                            </Button>
                                        ) : (
                                            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => addToCart(book.id)}>
                                                Add to Cart
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Cart / Checkout Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-28 border-0 shadow-lg">
                            <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Your Cart
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {cart.length === 0 ? (
                                    <p className="text-center text-slate-500 py-8">Your cart is empty.</p>
                                ) : (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            {selectedBooks.map(book => (
                                                <div key={book.id} className="flex justify-between items-start text-sm">
                                                    <span className="text-slate-700 font-medium flex-1 mr-2">{book.title}</span>
                                                    <span className="font-bold text-slate-900">₹{book.price}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                                                <span>Total</span>
                                                <span>₹{totalAmount}</span>
                                            </div>
                                        </div>

                                        {!showForm ? (
                                            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => setShowForm(true)}>
                                                Proceed to Buy ({cart.length} items)
                                            </Button>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                    <Truck className="w-4 h-4" /> Shipping Details
                                                </h3>

                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Address</Label>
                                                    <Input
                                                        id="address"
                                                        value={formData.address}
                                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="city">City</Label>
                                                        <Input
                                                            id="city"
                                                            value={formData.city}
                                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="pincode">Pincode</Label>
                                                        <Input
                                                            id="pincode"
                                                            value={formData.pincode}
                                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                                                    Place Order (COD)
                                                </Button>
                                            </form>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
