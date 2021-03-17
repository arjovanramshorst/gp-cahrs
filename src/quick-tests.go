package src

const SIZE = 12000

func main() {
	a := fill(10)
	b := fill(5)
}

func fill(f int) [SIZE][SIZE]int {
	var a [SIZE][SIZE]int
	for i := 0; i < SIZE; i++ {
		for j := 0; j < SIZE; j++ {
			a[i][j] = f
		}
	}
	return a
}

func sum(a, b [][]int) [][]int {
	len(a)
}